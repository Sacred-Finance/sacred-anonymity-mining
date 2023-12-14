import { forumContract, getRpcProvider } from '@/constant/const'
import { setCache } from '@/lib/redis'
import {
  getContent,
  getIpfsHashFromBytes32,
  parseComment,
  parsePost,
  uploadImageToIPFS,
} from '@/lib/utils'
import type { CommunityDetails, Requirement } from '@/lib/model'
import { ContentType } from '@/lib/model'

import pica from 'pica'
import { useCallback } from 'react'
import type {
  Group,
  Item,
  RawGroupData,
  RawItemData,
} from '@/types/contract/ForumInterface'
import type { Event } from '@ethersproject/contracts'
import { erc20dummyABI } from '@/constant/erc20dummyABI'
import { getContract } from 'viem'
import { toNumber } from 'lodash'

type GroupId = number

interface FetchCommunitiesDataParams {
  groups: Array<Event | GroupId>
}

export const fetchCommunitiesData = async ({
  groups,
}: FetchCommunitiesDataParams): Promise<Awaited<Group>[]> => {
  // ensure the event has the right name
  try {
    const groupIds = groups.map(group =>
      typeof group === 'number' ? group : group?.args?.['groupId']?.toNumber()
    )

    console.log('fetchCommunitiesData', groupIds)

    const checkEvent = groups.filter(
      group => typeof group !== 'number' && group.event === 'NewGroupCreated'
    )

    if (
      checkEvent.length !==
      groups.filter(group => typeof group !== 'number').length
    ) {
      console.error('Event name is not NewGroupCreated')
      throw new Error('Event name is not NewGroupCreated')
    }

    const updatedDataPromises = groupIds.map(async (groupId, index) => {
      let groupData: Group
      try {
        groupData = (await forumContract.read.groupAt([groupId])) as Group
        if (groupData?.removed) {
          return undefined
        }
      } catch (error) {
        return undefined
      }

      const requirementDetails = await addRequirementDetails(groupData)

      return {
        groupId,
        name: groupData?.name,
        id: groupData?.id,
        userCount: groupData?.userCount || 0,
        note: groupData?.note?.toString(), // todo:review this
        requirements: requirementDetails,
        chainId: groupData?.chainId,
        removed: groupData?.removed,
        banner: groupData?.groupDetails.bannerCID
          ? getIpfsHashFromBytes32(groupData.groupDetails.bannerCID)
          : undefined,
        logo: groupData?.groupDetails.logoCID
          ? getIpfsHashFromBytes32(groupData.groupDetails.logoCID)
          : undefined,
        groupDetails: groupData.groupDetails,
      } as unknown as Group
    })

    const result = await Promise.all(updatedDataPromises)
    return result.filter(group => group) as Group[]
  } catch (error) {
    console.trace('error', error)
    return []
  }
}

type UploadImagesParams = {
  bannerFile?: File | null
  logoFile?: File | null
}

export const uploadImages = async ({
  bannerFile,
  logoFile,
}: UploadImagesParams): Promise<{
  bannerCID: string | null
  logoCID: string | null
}> => {
  const [bannerResult, logoResult] = await Promise.allSettled([
    bannerFile ? uploadImageToIPFS(bannerFile) : Promise.resolve(null),
    logoFile ? uploadImageToIPFS(logoFile) : Promise.resolve(null),
  ])

  let bannerCID: string | null = null
  let logoCID: string | null = null

  if (bannerResult.status === 'fulfilled' && bannerResult.value) {
    bannerCID = bannerResult.value
  } else if (bannerResult.status === 'rejected' && bannerFile) {
    console.error('Error uploading banner image:', bannerResult.reason)
  }

  if (logoResult.status === 'fulfilled' && logoResult.value) {
    logoCID = logoResult.value
  } else if (logoResult.status === 'rejected' && logoFile) {
    console.error('Error uploading logo image:', logoResult.reason)
  }

  return { bannerCID, logoCID }
}

export const cacheGroupData = async ({
  groupId,
  groupData,
  chainId,
  requirements,
  details,
}: {
  groupId: number
  groupData: any
  chainId: number
  requirements: Requirement[]
  details: CommunityDetails
}): Promise<{
  name?: string
  groupId?: number
  id?: any
  note?: string
  groupData: any
  chainId: number
  requirements: Requirement[]
  removed: boolean
  details: CommunityDetails
  banner: string
  logo: string
}> => {
  const {
    blockHash,
    args,
    event,
    transactionIndex,
    blockNumber,
    ...otherData
  } = groupData
  const [groupIdArg, nameArg, note] = args
  const groupIdInt = parseInt(groupIdArg.hex, 16)

  const cacheData: {
    name?: string
    groupId?: number
    id?: any
    note?: string
    groupData: any
    chainId: number
    requirements: Requirement[]
    removed: boolean
    details: CommunityDetails
    banner: string
    logo: string
  } = {
    name: nameArg,
    groupId: groupIdInt,
    id: groupIdArg,
    note: note.toString(),
    groupData: {
      blockHash,
      args,
      event,
      transactionIndex,
      blockNumber,
      ...otherData,
    },
    chainId,
    requirements,
    removed: false,
    details,
    banner: details.bannerCID,
    logo: details.logoCID,
  }

  await setCache(`group_${groupId}`, cacheData)

  return cacheData
}

export const useHandleFileImageUpload = setImageFileState => {
  return useCallback(e => {
    console.log('e', e, setImageFileState)
    handleFileImageUpload(e, setImageFileState)
  }, [])
}

export const handleFileImageUpload = (e, setImageFileState) => {
  const file = e?.target?.files?.[0]
  const imageType = e?.target?.name
  // Create a new Image object to check the dimensions
  const img = new Image()
  try {
    img.src = URL.createObjectURL(file)
  } catch (error) {
    console.error('Error uploading image:', error)
    return
  }
  img.onload = () => {
    // Define the required aspect ratios for banners and logos
    const requiredAspectRatios = {
      banner: 16 / 9,
      logo: 1, // assuming you want a square logo
    }

    const requiredDimensions = {
      banner: { width: 1920, height: 640 },
      logo: { width: 512, height: 512 },
    }

    // Calculate the aspect ratio of the uploaded image
    const imageAspectRatio = img.width / img.height

    // Check if the uploaded image's aspect ratio matches the required one
    if (Math.abs(imageAspectRatio - requiredAspectRatios[imageType]) <= 0.1) {
      // Set the file based on the image type
      setImageFileState({ file, imageType: imageType })
    } else {
      // Create a canvas to resize the image
      const canvas = document.createElement('canvas')
      canvas.width = requiredDimensions[imageType].width
      canvas.height = requiredDimensions[imageType].height

      // Resize the image using pica
      pica()
        .resize(img, canvas)
        .then(result => {
          // Convert the resized image to a Blob, then create a File object
          return pica().toBlob(result, 'image/jpeg', 1)
        })
        .then(blob => {
          // Create a new File object
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
          })

          // Set the file based on the image type
          setImageFileState({ file: resizedFile, imageType: imageType })
        })
        .catch(err => {
          console.error('Image resizing failed:', err)
        })
    }
  }
}
export const addRequirementDetails = async (
  community: Group
): Promise<Awaited<Requirement[]>> => {
  if (!community.requirements) {
    return []
  }

  return Promise.all(
    community.requirements.map(requirement =>
      processRequirement(requirement, community.chainId)
    )
  )
}

const processRequirement = async (
  requirement: Requirement,
  chainId: number
) => {
  const defaultResponse = {
    tokenAddress: requirement.tokenAddress,
    symbol: '',
    name: '',
    decimals: '',
    minAmount: requirement.minAmount.toString(),
  }

  if (!requirement.tokenAddress) {
    return defaultResponse
  }

  const token = await createTokenContract(requirement, chainId)

  if (!token) {
    console.warn('Token contract not initialized:', requirement.tokenAddress)
    return defaultResponse
  }

  const tokenDetails = await fetchTokenDetails(token)
  return { ...defaultResponse, ...tokenDetails }
}

const createTokenContract = async (
  requirement: Requirement,
  chainId: number
) => {
  try {
    return getContract({
      address: requirement.tokenAddress as `0x${string}`,
      abi: erc20dummyABI,
      publicClient: getRpcProvider(chainId),
    })
  } catch (error) {
    console.error('Error creating token contract:', error)
    return null
  }
}

const fetchTokenDetails = async token => {
  const details = { symbol: '', name: '', decimals: '' }

  try {
    details.symbol = await token.read.symbol()
  } catch (error) {
    console.error('Error fetching token symbol:', error)
  }

  try {
    details.name = await token.read.name()
  } catch (error) {
    console.error('Error fetching token name:', error)
  }

  try {
    details.decimals = await token.read.decimals()
  } catch (error) {
    console.error('Error fetching token decimals:', error)
  }

  return details
}

// Normalization function
function serializeGroupData(rawGroupData: RawGroupData): Group {
  return {
    id: Number(rawGroupData.id.toString()),
    name: rawGroupData.name,
    groupId: rawGroupData.id.toString(),
    groupDetails: {
      bannerCID: getIpfsHashFromBytes32(
        rawGroupData.groupDetails.bannerCID.toString()
      ),
      logoCID: getIpfsHashFromBytes32(
        rawGroupData.groupDetails.logoCID.toString()
      ),
      description: rawGroupData.groupDetails.description.toString(),
      tags: rawGroupData.groupDetails.tags.map(t => t.toString()),
    },
    requirements: rawGroupData?.requirements?.map(r => ({
      tokenAddress: r.tokenAddress,
      minAmount: r.minAmount.toString(),
    })),
    note: rawGroupData.note.toString(),
    userCount: Number(rawGroupData.userCount.toString()),
    chainId: Number(rawGroupData.chainId.toString()),
    posts: rawGroupData.posts.map(p => p.toString()),
    removed: rawGroupData.removed,
  }
}

export async function augmentGroupData(
  rawGroupData: RawGroupData,
  forPaths = false
): Promise<Group> {
  const normalizedGroupData = serializeGroupData(rawGroupData)
  console.log('normalizedGroupData', normalizedGroupData, forPaths)

  if (forPaths) {
    return normalizedGroupData
  }

  normalizedGroupData.requirements =
    await addRequirementDetails(normalizedGroupData)

  return normalizedGroupData
}

function serializeRawItemData(rawItemData: RawItemData): Item {
  return {
    kind: toNumber(rawItemData?.kind?.toString()),
    id: rawItemData?.id?.toString(),
    parentId: rawItemData?.parentId.toString(),
    groupId: rawItemData?.groupId.toString(),
    createdAtBlock: toNumber(rawItemData?.createdAtBlock?.toString()),
    childIds: rawItemData?.childIds?.map(id => id.toString()),
    upvote: toNumber(rawItemData?.upvote?.toString()),
    downvote: toNumber(rawItemData?.downvote?.toString()),
    note: rawItemData?.note.toString(),
    ownerEpoch: rawItemData?.ownerEpoch?.toString(),
    ownerEpochKey: rawItemData?.ownerEpochKey?.toString(),
    contentCID: getIpfsHashFromBytes32(rawItemData.contentCID?.toString()),
    removed: rawItemData?.removed,
  }
}

export async function augmentItemData(rawItemData: RawItemData): Promise<Item> {
  try {
    const normalizedItemData = serializeRawItemData(rawItemData)
    const stringifiedContent = await getContent(normalizedItemData.contentCID)
    if (!stringifiedContent) {
      return {
        ...normalizedItemData,
        removed: true,
      }
    }
    let content
    if (normalizedItemData.kind == ContentType.COMMENT) {
      content = parseComment(stringifiedContent)
    } else {
      content = parsePost(stringifiedContent)
    }

    return {
      ...normalizedItemData,
      ...content,
    }
  } catch (e) {
    console.error('augmentItemData', e)
    return {
      ...serializeRawItemData(rawItemData),
      removed: true,
    }
  }
}

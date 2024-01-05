import { forumContract } from '@/constant/const'
import {
  getContent,
  getIpfsHashFromBytes32,
  parseComment,
  parsePost,
  uploadImageToIPFS,
} from '@/lib/utils'
import type { Requirement } from '@/lib/model'
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
import { toNumber } from 'lodash'
import type { FetchTokenResult } from '@wagmi/core'
import { fetchToken } from '@wagmi/core'
import type { Unit } from 'wagmi'
import type { HandleSetImage } from '@/pages/communities/[groupId]/edit'

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

    const updatedDataPromises = groupIds.map(async groupId => {
      let groupData: Group
      try {
        console.log('fetching group', groupId)
        groupData = (await forumContract.read.groupAt([
          groupId,
        ])) as unknown as Group
        if (groupData?.removed) {
          return undefined
        }
      } catch (error) {
        return undefined
      }

      const requirementDetails = await addRequirementDetails({
        community: groupData,
      })

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
  // avoid uploading images if they are not provided or haven't changed
  const [bannerResult, logoResult] = await Promise.allSettled([
    bannerFile ? uploadImageToIPFS(bannerFile) : Promise.resolve(null),
    logoFile ? uploadImageToIPFS(logoFile) : Promise.resolve(null),
  ])

  console.log('bannerResult', bannerResult)
  console.log('logoResult', logoResult)

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

export const useHandleFileImageUpload = (setImageFileState: {
  ({ file, imageType }: HandleSetImage): void
  (arg0: { file: File; imageType: 'banner' | 'logo' }): void
}) => {
  return useCallback(
    (e: { target: { files: File[]; name: string } }) => {
      handleFileImageUpload(e, setImageFileState)
    },
    [setImageFileState]
  )
}

export const handleFileImageUpload = (
  e: { target: { files: File[]; name: string } },
  setImageFileState: (arg0: {
    file: File
    imageType: 'banner' | 'logo'
  }) => void
) => {
  const file = e?.target?.files?.[0]
  const imageType = e?.target?.name as 'banner' | 'logo'
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

export const addRequirementDetails = async ({
  community,
}: {
  community: Group
}): Promise<Requirement[]> => {
  if (!community?.requirements?.length) {
    return []
  }

  // The ABI for the token contracts will be provided later

  try {
    const tokens = (await Promise.all(
      community.requirements.map(async requirement => {
        try {
          const fetchData = {
            address: requirement.tokenAddress.toLowerCase() as `0x${string}`,
            chainId: community.chainId,
            formatUnits: 'ether' as Unit,
          }
          return fetchToken(fetchData)
        } catch (error) {
          console.error('Error fetching token details:', error)
          return {
            tokenAddress: requirement.tokenAddress,
            name: 'Unknown',
            symbol: 'Unknown',
            decimals: 18,
          }
        }
      })
    )) as Partial<FetchTokenResult>[]

    // remove totalSupply
    tokens.forEach(token => {
      if (token.totalSupply) {
        delete token.totalSupply
      }
    })

    return community.requirements.map((requirement, index) => {
      return {
        ...requirement,
        ...tokens[index],
      }
    }) as Requirement[]
  } catch (error) {
    console.error('Error fetching token details:', error)
    return community.requirements.map(requirement => ({
      tokenAddress: requirement.tokenAddress,
      name: 'Unknown',
      symbol: 'Unknown',
      decimals: 18,
    })) as Requirement[]
  }
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
    posts: rawGroupData.posts.map(p => Number(p.toString())),
    removed: rawGroupData.removed,
  }
}

export async function augmentGroupData(
  rawGroupData: RawGroupData,
  forPaths = false
): Promise<Group> {
  const normalizedGroupData = serializeGroupData(rawGroupData)

  if (forPaths) {
    return normalizedGroupData
  }

  if (!normalizedGroupData.requirements) {
    return {
      ...normalizedGroupData,
      requirements: [],
    }
  }

  console.log('normalizedGroupData', normalizedGroupData)
  normalizedGroupData.requirements = await addRequirementDetails({
    community: normalizedGroupData,
  })

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
    contentCID: getIpfsHashFromBytes32(rawItemData.contentCID?.toString()),
    removed: rawItemData?.removed,
  }
}

export async function augmentItemData(rawItemData: RawItemData): Promise<Item> {
  try {
    const normalizedItemData = serializeRawItemData(rawItemData)
    console.log('normalizedItemData', normalizedItemData)
    const stringifiedContent = await getContent(normalizedItemData.contentCID)

    if (!stringifiedContent) {
      console.error('augmentItemData: no content')
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

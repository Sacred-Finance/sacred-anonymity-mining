import { BigNumber, ethers } from 'ethers'
import { erc20dummyABI, forumContract, jsonRPCProvider } from '@/constant/const'
import { getCache, getMCache, setCache } from '@/lib/redis'
import { getIpfsHashFromBytes32, uploadImageToIPFS } from '@/lib/utils'
import { CommunityDetails, Requirement } from '@/lib/model'

import pica from 'pica'
import { useCallback } from 'react'
import { Group } from '@/types/contract/ForumInterface'
import { Event } from '@ethersproject/contracts/src.ts'

type GroupId = number

interface FetchCommunitiesDataParams {
  groups: Array<Event | GroupId>
}

export const fetchCommunitiesData = async ({ groups }: FetchCommunitiesDataParams): Promise<Awaited<Group>[]> => {
  // ensure the event has the right name
  try {
    const groupIds = groups.map(group => (typeof group === 'number' ? group : group?.args?.['groupId']?.toNumber()))

    const checkEvent = groups.filter(group => typeof group !== 'number' && group.event === 'NewGroupCreated')

    if (checkEvent.length !== groups.filter(group => typeof group !== 'number').length) {
      console.error('Event name is not NewGroupCreated')
      throw new Error('Event name is not NewGroupCreated')
    }

    const updatedDataPromises = groupIds.map(async (groupId, index) => {
      let groupData
      try {
        groupData = await forumContract.groupAt(groupId.toString())
        if (groupData?.removed) {
          return undefined
        }
      } catch (error) {
        return undefined
      }

      const requirementDetails = await addRequirementDetails(groupData)

      return {
        groupId: groupId,
        name: groupData?.name,
        id: groupData?.id,
        userCount: groupData?.userCount?.toNumber() || 0,
        note: groupData?.note,
        requirements: requirementDetails,
        chainId: groupData?.chainId?.toNumber(),
        removed: groupData?.removed,
        banner: getIpfsHashFromBytes32(groupData?.groupDetails.bannerCID),
        logo: getIpfsHashFromBytes32(groupData?.groupDetails.logoCID),
        groupDetails: groupData.groupDetails,
      } as Group
    })

    const result = await Promise.all(updatedDataPromises)
    return result.filter(group => group) as Group[]
  } catch (error) {
    console.trace('error', error)
    return []
  }
}

interface UploadAndCacheImagesParams {
  groupId: number
  bannerFile?: File | null
  logoFile?: File | null
}

interface ImageCacheData {
  banner?: string
  logo?: string
}

type UploadImagesParams = {
  bannerFile?: File | null
  logoFile?: File | null
}

export const uploadImages = async ({
  bannerFile,
  logoFile,
}: UploadImagesParams): Promise<{ bannerCID: string | null; logoCID: string | null }> => {

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
  groupId: any
  groupData: any
  chainId: number
  requirements: Requirement[]
  details: CommunityDetails
}): Promise<any> => {
  const { blockHash, args, event, transactionIndex, blockNumber, ...otherData } = groupData
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
    const requiredDimensionsText = '1920x1080px for banners and 512x512px for logos.'

    const requiredDimensions = {
      banner: { width: 1920, height: 640 },
      logo: { width: 512, height: 512 },
    }

    // Calculate the aspect ratio of the uploaded image
    const imageAspectRatio = img.width / img.height

    // Check if the uploaded image's aspect ratio matches the required one
    if (Math.abs(imageAspectRatio - requiredAspectRatios[imageType]) <= 0.01) {
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

export const addRequirementDetails = async (community: Group): Promise<Awaited<Requirement[]>> => {
  // looking at the requirements array, we need to get the details of each requirement from the contract and add it to the community object
  // get symbol and name of token
  return (await Promise.all(
    community.requirements.map(async requirement => {
      const token = await new ethers.Contract(requirement.tokenAddress, erc20dummyABI, jsonRPCProvider)
      const symbol = await token.symbol()
      const name = await token.name()
      const decimals = await token.decimals()
      const minAmount = requirement.minAmount

      return {
        tokenAddress: requirement.tokenAddress,
        symbol,
        name,
        decimals,
        minAmount,
      }
    })
  )) as Requirement[]
}

const maxCacheAge = 1000 * 60 * 60 * 24 // 24 hours

const fetchCommunitiesDataFromCache = async (
  groupIds: number[]
): Promise<((Group & { refresh: boolean }) | null)[]> => {
  const cacheKeys = groupIds.map(groupId => `group_${groupId}`)
  const { cache: cachedDataArray } = await getMCache(cacheKeys, true)

  return groupIds.map((groupId, index) => {
    const cachedData = cachedDataArray[index]
    let refresh = false
    // example of lastCachedAt value 1687468176683

    if (cachedData?.data && !isNaN(groupId)) {
      const cacheData = cachedData.data
      const lastCachedAt = cachedData?.lastCachedAt
      if (maxCacheAge < Date.now() - lastCachedAt) {
        refresh = true
        console.log('refreshing cache for group', groupId)
        console.log('last cache in hours', (Date.now() - lastCachedAt) / 1000 / 60 / 60)
      }
      if (!cacheData?.note) {
        return null
      }
      return {
        ...cacheData,
        groupId,
        id: BigNumber.from(groupId),
        note: cacheData?.note,
        refresh: false, // assuming refresh should be false as per the provided getMCache implementation
      }
    }

    return null
  })
}

export const uploadAndCacheImages = async ({
  groupId,
  bannerFile,
  logoFile,
}: UploadAndCacheImagesParams): Promise<ImageCacheData> => {
  try {
    if (!bannerFile && !logoFile) {
      const existingCache = await getCache(`group_${groupId}`)
      return existingCache.cache
    }

    const [bannerResult, logoResult] = await Promise.allSettled([
      bannerFile ? uploadImageToIPFS(bannerFile) : Promise.resolve(null),
      logoFile ? uploadImageToIPFS(logoFile) : Promise.resolve(null),
    ])

    const existingCache = await getCache(`group_${groupId}`)
    const updatedCacheData: ImageCacheData = {}

    if (bannerResult.status === 'fulfilled' && bannerResult.value) {
      updatedCacheData.banner = bannerResult.value
    } else if (bannerResult.status === 'rejected' && bannerFile) {
      console.error('Error uploading banner image:', bannerResult.reason)
    }

    if (logoResult.status === 'fulfilled' && logoResult.value) {
      updatedCacheData.logo = logoResult.value
    } else if (logoResult.status === 'rejected' && logoFile) {
      console.error('Error uploading logo image:', logoResult.reason)
    }

    if (Object.keys(updatedCacheData).length > 0) {
      const mergedCacheData = {
        ...(existingCache.cache ?? {}),
        ...updatedCacheData,
      }

      await setCache(`group_${groupId}`, mergedCacheData)

      return mergedCacheData
    } else {
      throw new Error('Both banner and logo uploads failed.')
    }
  } catch (error) {
    console.error('Error caching group images:', error)
    throw error
  }
}

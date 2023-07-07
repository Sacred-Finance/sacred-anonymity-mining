import { BigNumber } from 'ethers'
import { forumContract } from '@/constant/const'
import { getCache, getMCache, setCache } from '@/lib/redis'
import { uploadImageToIPFS } from '@/lib/utils'
import { CommunityDetails, Requirement } from '@/lib/model'

import pica from 'pica'
import { useCallback } from 'react'
import { Group, GroupDetails } from '@/types/contract/ForumInterface'
import { Event } from '@ethersproject/contracts/src.ts'

interface FetchCommunitiesDataParams {
  groups: Array<Event>
}

export const fetchCommunitiesData = async ({
  groups,
}: FetchCommunitiesDataParams): Promise<
  Awaited<null | {
    id: bigint
    note: bigint
    requirements: Requirement[]
    userCount: number
    removed: any
    chainId: number
    groupId: number
    name: string
    banner: GroupDetails['bannerCID']
    logo: GroupDetails['logoCID']
    description: GroupDetails['description']
    tags: GroupDetails['tags']
  }>[]
> => {
  // ensure the event has the right name
  try {
    const groupIds = groups.map(group => group?.args?.['groupId']?.toNumber())
    const checkEvent = groups.filter(group => group.event === 'NewGroupCreated')
    if (checkEvent.length !== groups.length) {
      console.error('Event name is not NewGroupCreated')
      throw new Error('Event name is not NewGroupCreated')
    }
    const updatedDataPromises = groupIds.map(async (groupId, index) => {
      let groupData
      try {
        groupData = await forumContract.groupAt(groupId.toString())
        if (groupData?.removed) {
          return null
        }
      } catch (error) {
        return null
      }

      return {
        groupId: groupId,
        name: groupData?.name,
        id: groupData?.id,
        userCount: groupData?.userCount?.toNumber() || 0,
        note: groupData?.note,
        requirements: groupData.requirements,
        chainId: groupData?.chainId?.toNumber(),
        removed: groupData?.removed,
        banner: groupData?.groupDetails.bannerCID,
        logo: groupData?.groupDetails.logoCID,
        description: groupData?.groupDetails.description,
        tags: groupData?.groupDetails.tags,
      }
    })

    return Promise.all(updatedDataPromises)
  } catch (error) {
    console.trace('error', error)
    return []
  }
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
}: UploadImagesParams): Promise<[string | null, string | null]> => {
  const [bannerResult, logoResult] = await Promise.allSettled([
    bannerFile ? uploadImageToIPFS(bannerFile) : Promise.resolve(null),
    logoFile ? uploadImageToIPFS(logoFile) : Promise.resolve(null),
  ])

  let bannerUrl: string | null = null
  let logoUrl: string | null = null

  if (bannerResult.status === 'fulfilled' && bannerResult.value) {
    bannerUrl = bannerResult.value
  } else if (bannerResult.status === 'rejected' && bannerFile) {
    console.error('Error uploading banner image:', bannerResult.reason)
  }

  if (logoResult.status === 'fulfilled' && logoResult.value) {
    logoUrl = logoResult.value
  } else if (logoResult.status === 'rejected' && logoFile) {
    console.error('Error uploading logo image:', logoResult.reason)
  }

  console.log('bannerUrl', bannerUrl)
  console.log('logoUrl', logoUrl)

  return [bannerUrl, logoUrl]
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

export const useHandleFileImageUpload = setImageFileState => {
  return useCallback(e => {
    handleFileImageUpload(e, setImageFileState)
  }, [])
}
export const handleFileImageUpload = (e, setImageFileState) => {
  const file = e.target.files[0]

  // Create a new Image object to check the dimensions
  const img = new Image()
  img.src = URL.createObjectURL(file)
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

    const imageType = e.target.name

    // Calculate the aspect ratio of the uploaded image
    const imageAspectRatio = img.width / img.height

    // Check if the uploaded image's aspect ratio matches the required one
    if (Math.abs(imageAspectRatio - requiredAspectRatios[imageType]) <= 0.01) {
      // Set the file based on the image type
      setImageFileState(file)
    } else {
      // Show an error message if the aspect ratio doesn't match
      // toast({
      //   title: "Image aspect ratio mismatch",
      //   description: `The uploaded ${imageType} has an aspect ratio of ${imageAspectRatio} - and does not meet the recommended aspect ratio of ${requiredDimensionsText}. We will try to resize it, but the quality might be affected.`,
      //   position: "top",
      //   }
      // );

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
          setImageFileState(resizedFile)
        })
        .catch(err => {
          console.error('Image resizing failed:', err)
        })
    }
  }
}

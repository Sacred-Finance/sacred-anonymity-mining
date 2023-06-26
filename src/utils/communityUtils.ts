import { Community as CommunityInterface } from '../lib/model'

import { BigNumber, ethers } from 'ethers'
import { erc20dummyABI, forumContract, jsonRPCProvider } from '../constant/const'
import { getCache, getMCache, setCache } from '../lib/redis'
import { uploadImageToIPFS } from '../lib/utils'
import { fetchTokenInfo } from './tokenUtils'
import pica from 'pica'
import { useCallback } from 'react'

interface FetchCommunityDataParams {
  group: any
}

interface FetchCommunitiesDataParams {
  groups: any[]
  provider
}
export const fetchCommunitiesData = async ({
  groups,
  provider,
}: FetchCommunitiesDataParams): Promise<CommunityInterface[] | null> => {
  try {
    if (!provider) throw new Error('Provider not found')
    const groupIds = groups.map(group => group?.args?.['groupId']?.toNumber())

    const cachedDataArray = await fetchCommunitiesDataFromCache(groupIds)

    const updatedDataPromises = groupIds.map(async (groupId, index) => {
      const cachedData = cachedDataArray[index]

      if (cachedData?.removed) {
        return null
      }

      const shouldReturnCachedData =
        !cachedData?.refresh &&
        cachedData &&
        cachedData.ownerIdentity &&
        !!cachedData.requirements &&
        cachedData.name &&
        !isNaN(cachedData?.userCount)

      if (shouldReturnCachedData) {
        return cachedData
      } else {
        console.log('cachedData - communitiesData', { groupId }, cachedData?.userCount, cachedData?.groupId)
      }

      let groupData
      try {
        groupData = await forumContract.groupInfo(groupId.toString())
        if (groupData[5]) {
          console.log('groupData removed', groupData)
          // if community is removed
          return null
        }
        console.log('groupData', groupData)
      } catch (error) {
        console.log('error', error)
        return null
      }

      const fulfilledRequirements = await fetchGroupRequirements(groupId.toString(), groupData?.[4]?.toNumber())

      const group = groups[index]
      const identity = group.args['creatorIdentityCommitment'].toString()

      const newData = {
        groupId: groupId,
        name: group.args['name'],
        id: group.args['groupId'],
        userCount: groupData?.[3]?.toNumber?.() || 0,
        requirements: fulfilledRequirements,
        ownerIdentity: identity,
        chainId: groupData?.[4]?.toNumber(),
        removed: groupData?.[5],
      }
      // remove groupData from newData if it exists
      if (newData?.['groupData']) {
        delete newData?.['groupData']
      }
      if (cachedData?.['groupData']) {
        delete cachedData?.['groupData']
      }

      const mergedData = cachedData ? { ...cachedData, ...newData } : newData

      await setCache(`group_${groupId}`, mergedData)

      return mergedData
    })

    return await Promise.all(updatedDataPromises)
  } catch (error) {
    console.trace('error', error)
    return null
  }
}

export const fetchCommunityData = async ({ group }: FetchCommunityDataParams): Promise<CommunityInterface | null> => {
  try {
    const groupId = group?.args?.['groupId']?.toNumber()
    console.log('groupId', groupId)
    const cachedData = await fetchCommunityDataFromCache(groupId)

    console.log('cachedData', cachedData)
    if (cachedData?.removed) {
      return null
    }

    const shouldReturnCachedData =
      !cachedData?.refresh &&
      cachedData &&
      cachedData.ownerIdentity &&
      !!cachedData.requirements &&
      cachedData.name &&
      !isNaN(cachedData.userCount)

    if (shouldReturnCachedData) {
      return cachedData
    } else {
      console.log('shouldReturnCachedData', cachedData.userCount, cachedData.groupId)
    }

    let groupData
    try {
      groupData = await forumContract.groupInfo(groupId.toString())
      // if community is removed
      if (groupData[5]) {
        return null
      }
      console.log('groupData', groupData)
    } catch (error) {
      console.log('error', error)
      return null
    }

    const fulfilledRequirements = await fetchGroupRequirements(groupId, groupData?.[4]?.toNumber())
    const identity = group.args['creatorIdentityCommitment'].toString()

    const newData = {
      groupId: groupId,
      name: group.args['name'],
      id: group.args['groupId'],
      userCount: groupData?.[3]?.toNumber() || 0,
      requirements: fulfilledRequirements,
      ownerIdentity: identity,
      chainId: groupData?.[4]?.toNumber(),
      removed: groupData?.[5],
    }

    // Merge new data with existing cached data, if available
    const mergedData = cachedData ? { ...cachedData, ...newData } : newData

    // Cache the merged data
    await setCache(`group_${groupId}`, mergedData)

    return mergedData
  } catch (error) {
    console.log('error', error)
    return null
  }
}

export async function fetchGroupRequirements(groupId, chainId) {
  const groupRequirements = await forumContract.getGroupRequirements(groupId)
  const requirementsPromises = groupRequirements.map(async requirement => {
    const contract = new ethers.Contract(requirement.tokenAddress, erc20dummyABI, jsonRPCProvider)
    const { symbol, name, decimals } = await fetchTokenInfo(contract)
    return {
      minAmount: Number(requirement.minAmount),
      symbol,
      name,
      tokenAddress: requirement.tokenAddress,
      decimals,
    }
  })
  const requirements = await Promise.allSettled(requirementsPromises)
  return requirements.filter(r => r.status === 'fulfilled').map((r: PromiseFulfilledResult<any>) => r.value)
}

const fetchCommunityDataFromCache = async (
  groupId: number
): Promise<(CommunityInterface & { refresh: boolean }) | null> => {
  const cachedData = await getCache(`group_${groupId}`)

  if (cachedData && cachedData.cache) {
    const cacheData = cachedData.cache.data || cachedData.cache

    return {
      ...cacheData,
      groupId,
      id: BigNumber.from(groupId),
      ownerIdentity: BigNumber.from(cacheData.ownerIdentity).toString(),
    }
  }

  return null
}

const maxCacheAge = 1000 * 60 * 60 * 24 // 24 hours
const fetchCommunitiesDataFromCache = async (
  groupIds: number[]
): Promise<((CommunityInterface & { refresh: boolean }) | null)[]> => {
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
      if (!cacheData?.ownerIdentity) {
        return null
      }
      return {
        ...cacheData,
        groupId,
        id: BigNumber.from(groupId),
        ownerIdentity: BigNumber.from(cacheData.ownerIdentity).toString(),
        refresh, // assuming refresh should be false as per the provided getMCache implementation
      }
    }

    return null
  })
}

export const uploadThenCacheGroupData = async ({
  groupId,
  groupData,
  chainId,
  requirements,
  details,
}: {
  groupId: any
  groupData: any
  chainId: number
  requirements: []
  details: {
    description: string
    tags: string[]
    bannerCID: string
    logoCID: string
  }
}) => {
  const { blockHash, args, event, transactionIndex, blockNumber, ...otherData } = groupData
  const [groupIdArg, nameArg, creatorIdentityCommitmentArg] = args
  const groupIdInt = parseInt(groupIdArg.hex, 16)

  const cacheData: {
    name?: string
    groupId?: number
    id?: any
    ownerIdentity?: string
    groupData: any
    chainId: number
    requirements: []
    removed: boolean
  } = {
    name: nameArg,
    groupId: groupIdInt,
    id: groupIdArg,
    ownerIdentity: BigNumber.from(creatorIdentityCommitmentArg).toString(),
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
  }

  await setCache(`group_${groupId}`, cacheData)

  return {
    ...cacheData,
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
  requirements: []
  details: {
    description: string
    tags: string[]
    bannerCID: string
    logoCID: string
  }
}): Promise<any> => {
  const { blockHash, args, event, transactionIndex, blockNumber, ...otherData } = groupData
  const [groupIdArg, nameArg, creatorIdentityCommitmentArg] = args
  const groupIdInt = parseInt(groupIdArg.hex, 16)

  const cacheData: {
    name?: string
    groupId?: number
    id?: any
    ownerIdentity?: string
    groupData: any
    chainId: number
    requirements: []
    removed: boolean
    details: {
      description: string
      tags: string[]
      bannerCID: string
      logoCID: string
    }
    banner: string
    logo: string
  } = {
    name: nameArg,
    groupId: groupIdInt,
    id: groupIdArg,
    ownerIdentity: BigNumber.from(creatorIdentityCommitmentArg).toString(),
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

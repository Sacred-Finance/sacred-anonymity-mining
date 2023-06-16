import { ForumContractAddress } from '../constant/const'
import ForumABI from '../constant/abi/Forum.json'
import { fetchCommunityData } from '../utils/communityUtils'
import { polygonMumbai } from 'wagmi/chains'
import { useCommunityContext } from '../contexts/CommunityProvider'
import { useContract, useProvider } from 'wagmi'
import { Community } from '../lib/model'
import { useEffect } from 'react'

export const useFetchCommunities = (loadOnInit = true) => {
  const { dispatch } = useCommunityContext()

  const provider = useProvider({ chainId: polygonMumbai.id })
  const forumContract = useContract({
    address: ForumContractAddress,
    abi: ForumABI.abi,
    signerOrProvider: provider,
  })

  const fetchCommunities = async () => {
    if (!forumContract) {
      console.error('Forum contract not found')
      return
    }

    try {
      const groups = await forumContract.queryFilter(forumContract.filters.NewGroupCreated())

      const communityPromises = groups.reverse().map(group =>
        fetchCommunityData({
          group,
          forumContract,
          provider,
        })
      )

      const communityData = await Promise.allSettled(communityPromises)

      const fulfilledCommunities = communityData
        .filter(community => community.status === 'fulfilled')
        .map((community: PromiseFulfilledResult<any>) => community.value)
        .filter(community => community !== null)

      dispatch({
        type: 'SET_COMMUNITIES',
        payload: fulfilledCommunities,
      })
      return fulfilledCommunities
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (loadOnInit) fetchCommunities()
  }, [forumContract, provider])

  return fetchCommunities
}

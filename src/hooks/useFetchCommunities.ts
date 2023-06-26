import { ForumContractAddress, forumContract } from '../constant/const'
import { fetchCommunitiesData, fetchCommunityData } from '../utils/communityUtils'
import { useCommunityContext } from '../contexts/CommunityProvider'
import { useEffect } from 'react'

export const useFetchCommunities = (loadOnInit = true) => {
  const { dispatch } = useCommunityContext()
  const fetchCommunities = async () => {
    if (!forumContract) {
      console.error('Forum contract not found')
      return
    }
    try {
      const groups = await forumContract.queryFilter(forumContract.filters.NewGroupCreated())
      const communitiesData = await fetchCommunitiesData({ groups })
      const fulfilledCommunities = communitiesData?.filter(community => community)
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
  }, [forumContract])

  return fetchCommunities
}

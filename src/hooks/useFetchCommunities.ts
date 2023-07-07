import { forumContract } from '@/constant/const'
import { fetchCommunitiesData } from '@/utils/communityUtils'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { useEffect, useRef } from 'react'
import { Event } from '@ethersproject/contracts/src.ts'

export const useFetchCommunities = (loadOnInit = true) => {
  const { dispatch } = useCommunityContext()
  const fetchCommunities = async () => {
    if (!forumContract) {
      console.error('Forum contract not found')
      return
    }
    try {
      const groups: Array<Event> = await forumContract.queryFilter(forumContract.filters.NewGroupCreated())
      if (!groups) return
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
  const didLoadRef = useRef(false)
  useEffect(() => {
    if (didLoadRef.current) return
    didLoadRef.current = true
    if (loadOnInit) fetchCommunities()
  }, [])

  return fetchCommunities
}

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


type GroupId = number; // Define GroupId type or replace it with your actual type
export const useFetchCommunitiesByIds = (groupIds: GroupId[], loadOnInit = true) => {
  const { dispatch, state } = useCommunityContext()

  const fetchCommunities = async () => {
    if (!forumContract) {
      console.error('Forum contract not found')
      return
    }
    try {
      if (!groupIds) return
      const communitiesData = await fetchCommunitiesData({ groups: groupIds })
      const fulfilledCommunities = communitiesData?.filter(community => community)

      // Merge new and existing communities, and remove duplicates
      const existingGroupIds = new Set(state.communities.map(community => community.groupId));
      const uniqueCommunities = fulfilledCommunities.filter(community => !existingGroupIds.has(community.groupId));

      const mergedCommunities = [...state.communities, ...uniqueCommunities]

      dispatch({
        type: 'SET_COMMUNITIES',
        payload: mergedCommunities,
      })

      return mergedCommunities
    } catch (e) {
      console.error(e)
    }
  }

  const didLoadRef = useRef(false)

  useEffect(() => {
    if (didLoadRef.current) return
    didLoadRef.current = true
    if (loadOnInit) fetchCommunities()
  }, [groupIds, loadOnInit])

  return fetchCommunities
}

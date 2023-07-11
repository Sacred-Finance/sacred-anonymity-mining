import { forumContract } from '@/constant/const'
import { fetchCommunitiesData } from '@/utils/communityUtils'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { useEffect, useRef } from 'react'
import { Event } from '@ethersproject/contracts/src.ts'
import { Group } from '@/types/contract/ForumInterface'

export const useFetchCommunities = (loadOnInit = true) => {
  const { dispatch, state } = useCommunityContext()
  const fetchCommunities = async () => {
    if (state.communities.length > 0) {
      console.log('Communities already loaded')
      return state.communities
    } else {
      console.log('Fetching communities')
    }
    if (!forumContract) {
      console.error('Forum contract not found')
      return
    }
    try {
      const groups: Array<Event> = await forumContract.queryFilter(forumContract.filters.NewGroupCreated())
      if (!groups) return
      const communitiesData = await fetchCommunitiesData({ groups })
      dispatch({
        type: 'SET_COMMUNITIES',
        payload: communitiesData as Group[],
      })
      return communitiesData
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

type GroupId = number // Define GroupId type or replace it with your actual type
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

      // Merge new and existing communities, and remove duplicates
      const existingGroupIds = new Set(state.communities.map(community => community.groupId))
      const uniqueCommunities = communitiesData.filter(community => !existingGroupIds.has(community.groupId))
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

import { forumContract } from '@/constant/const'
import { fetchCommunitiesData } from '@/utils/communityUtils'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { useEffect, useRef } from 'react'
import { Event } from '@ethersproject/contracts'
import { Group } from '@/types/contract/ForumInterface'

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

import { forumContract } from '@/constant/const'
import { fetchCommunitiesData } from '@/utils/communityUtils'
import { ActionType, useCommunityContext } from '@/contexts/CommunityProvider'
import { useEffect, useRef } from 'react'

type GroupId = number // Define GroupId type or replace it with your actual type
export const useFetchCommunitiesByIds = (
  groupIds: GroupId[],
  loadOnInit = true
) => {
  const { dispatch, state } = useCommunityContext()

  const fetchCommunities = async () => {
    if (!forumContract) {
      console.error('Forum contract not found')
      return
    }
    try {
      if (!groupIds) {
        return
      }
      const communitiesData = await fetchCommunitiesData({ groups: groupIds })

      console.log('communitiesData', communitiesData)

      // Merge new and existing communities, and remove duplicates
      const existingGroupIds = new Set(
        state.communities.map(community => community.groupId)
      )
      const uniqueCommunities = communitiesData.filter(
        community => !existingGroupIds.has(community.groupId)
      )
      const mergedCommunities = [...state.communities, ...uniqueCommunities]

      dispatch({
        type: ActionType.SET_COMMUNITIES,
        payload: mergedCommunities,
      })

      return mergedCommunities
    } catch (e) {
      console.error(e)
    }
  }

  const didLoadRef = useRef(false)

  useEffect(() => {
    if (didLoadRef.current) {
      return
    }
    didLoadRef.current = true
    if (loadOnInit) {
      fetchCommunities()
    }
  }, [groupIds, loadOnInit])

  return fetchCommunities
}

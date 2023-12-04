import React, { useEffect } from 'react'
import LoadingPage from '@components/LoadingComponent'
import { CommunityPage } from '@components/CommunityPage'
import { ActionType, useCommunityContext } from '@/contexts/CommunityProvider'
import { ethers } from 'ethers'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import fetcher, { getGroupWithPostData } from '@/lib/fetcher'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'

function Group() {
  const router = useRouter()
  const { groupId } = router.query
  const { data, error, isValidating } = useSWR(getGroupWithPostData(groupId), fetcher)
  const { dispatch } = useCommunityContext()
  useCheckIfUserIsAdminOrModerator(true)

  const { group, posts, users } = data || {}

  useEffect(() => {
    if (data && !isValidating && !error && !data?.error) {
      dispatch({
        type: ActionType.SET_ACTIVE_COMMUNITY,
        payload: {
          community: group,
          posts,
        },
      })
      dispatch({
        type: ActionType.SET_USERS,
        payload: users,
      })
    }
  }, [group, posts, users, isValidating])
  if (error) return <div>Error: {error.message}</div>
  if (!data) return <LoadingPage />

  group.id = ethers.BigNumber.from(group.id)

  return (
    <div>
      <CommunityPage community={group} posts={posts} />
    </div>
  )
}

export default Group

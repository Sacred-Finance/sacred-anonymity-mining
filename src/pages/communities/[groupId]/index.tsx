import React, { useEffect } from 'react'
import { CommunityPage } from '@components/CommunityPage'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import fetcher, { GroupPostAPI } from '@/lib/fetcher'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import type { GroupWithPostDataResponse } from '@pages/api/groupWithPostData'
import { ActionType } from "@/contexts/CommunityTypes";

export default function Page() {
  const router = useRouter()
  const { groupId } = router.query

  const { data, error, isValidating, isLoading, mutate } =
    useSWR<GroupWithPostDataResponse>(GroupPostAPI(groupId), fetcher)

  const { dispatch } = useCommunityContext()
  useCheckIfUserIsAdminOrModerator(true)

  useEffect(() => {
    if (data?.users) {
      dispatch({
        type: ActionType.SET_USERS,
        payload: data?.users,
      })
    }
  }, [data])

  useEffect(() => {
    if (data?.group) {
      dispatch({
        type: ActionType.SET_ACTIVE_COMMUNITY,
        payload: {
          community: data?.group,
          postList: data?.posts,
        },
      })
    }
    return () => {
      dispatch({
        type: ActionType.SET_ACTIVE_COMMUNITY,
        payload: undefined,
      })
    }
  }, [data?.group])

  return (
    <CommunityPage
      community={data?.group}
      posts={data?.posts}
      refreshData={mutate}
    />
  )
}

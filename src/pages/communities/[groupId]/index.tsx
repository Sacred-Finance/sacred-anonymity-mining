import React, { useEffect } from 'react'
import { CommunityPage } from '@components/CommunityPage'
import { ActionType, useCommunityContext } from '@/contexts/CommunityProvider'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import fetcher, { GroupPostAPI } from '@/lib/fetcher'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { Group, Item } from '@/types/contract/ForumInterface'
import { User } from '@/lib/model'

interface Data {
  group: Group
  posts: Item[]
  users: User[]
}

export default function Page() {
  const router = useRouter()
  const { groupId } = router.query

  const { data, error, isValidating } = useSWR(GroupPostAPI(groupId), fetcher)
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
    if (data?.group && data?.posts) {
      dispatch({
        type: ActionType.SET_ACTIVE_COMMUNITY,
        payload: {
          community: data?.group,
          postList: data?.posts,
        },
      })
    }
  }, [data?.group, data?.posts])

  // if (error) {
  //   return <div>failed to load</div>
  // }
  // if (!data) {
  //   return <div>loading...</div>
  // }

  return (
    <div>
      <CommunityPage community={data?.group} posts={data?.posts} />
    </div>
  )
}

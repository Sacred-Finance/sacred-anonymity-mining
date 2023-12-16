import React, { useEffect } from 'react'
import { ActionType, useCommunityContext } from '@/contexts/CommunityProvider'
import { PostPage } from '@components/Post/PostPage'
import useSWR from 'swr'
import fetcher, { GroupPostCommentAPI } from '@/lib/fetcher'
import { useRouter } from 'next/router'
import LoadingComponent from '@components/LoadingComponent'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import { NextApiResponse } from 'next/types'
import { Group, Item } from '@/types/contract/ForumInterface'

function PostIndex() {
  const { dispatch, state } = useCommunityContext()
  const router = useRouter()
  const { groupId, postId } = router.query

  const { data, error, isLoading, mutate } = useSWR(
    GroupPostCommentAPI(groupId, postId),
    fetcher
  ) as unknown as NextApiResponse<{
    data: { group: Group; post: Item; comments: Item[] } | { error: string }
  }>
  useCheckIfUserIsAdminOrModerator(true)

  useEffect(() => {
    const { group, post, comments } = data || {}
    if (!group) {
      return
    }
    dispatch({
      type: ActionType.SET_ACTIVE_COMMUNITY,
      payload: {
        community: group,
        postList: [post],
      },
    })
    dispatch({
      type: ActionType.SET_ACTIVE_POST,
      payload: {
        community: group,
        post: post,
        comments: comments,
      },
    })
  }, [data?.group, data?.post, data?.comments])

  if (error) {
    return <div>Error: {error.message}</div>
  }
  const { group, post, comments } = data || {}

  if (!data || isLoading) {
    return <LoadingComponent />
  }

  return (
    <PostPage
      post={post}
      community={group}
      comments={comments}
      refreshData={mutate}
    />
  )
}

export default PostIndex

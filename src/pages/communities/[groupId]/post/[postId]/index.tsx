import React, { useEffect } from 'react'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { PostPage } from '@components/Post/PostPage'
import useSWR from 'swr'
import fetcher, { GroupPostCommentAPI } from '@/lib/fetcher'
import { useRouter } from 'next/router'
import LoadingComponent from '@components/LoadingComponent'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import type { NextApiResponse } from 'next/types'
import type { Group, Item } from '@/types/contract/ForumInterface'
import { ActionType } from '@/contexts/CommunityTypes'
import type { GroupWithPostAndCommentDataResponse } from '@pages/api/groupWithPostAndCommentData'

function PostIndex() {
  const { dispatch, state } = useCommunityContext()
  const router = useRouter()
  const { groupId, postId } = router.query

  const { data, error, isLoading, mutate } = useSWR<GroupWithPostAndCommentDataResponse>(
    GroupPostCommentAPI(groupId, postId),
    fetcher
  )
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

  if (!group || !post) {
    return null
  }
  return <PostPage post={post} community={group} comments={comments} mutate={mutate} />
}

export default PostIndex

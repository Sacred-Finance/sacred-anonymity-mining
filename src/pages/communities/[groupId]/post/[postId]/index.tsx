import React, { useEffect } from 'react'
import { ActionType, useCommunityContext } from '@/contexts/CommunityProvider'
import { PostPage } from '@components/Post/PostPage'
import useSWR from 'swr'
import fetcher, { GroupPostCommentAPI } from '@/lib/fetcher'
import { useRouter } from 'next/router'
import LoadingComponent from '@components/LoadingComponent'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'

function PostIndex() {
  const { dispatch, state } = useCommunityContext()
  const router = useRouter()
  const { groupId, postId } = router.query

  const { data, error, isLoading, mutate } = useSWR(
    GroupPostCommentAPI(groupId, postId),
    fetcher
  )
  useCheckIfUserIsAdminOrModerator(true)

  useEffect(() => {
    const { group, post, comments } = data || {}
    if (!group || !post || !comments) {
      return
    }
    if (state?.activeCommunity?.community?.groupId !== group.groupId) {
      dispatch({
        type: ActionType.SET_ACTIVE_COMMUNITY,
        payload: {
          community: group,
          postList: [post],
        },
      })
    }
    if (state?.activePost?.post?.id === post.id) {
      dispatch({
        type: ActionType.SET_ACTIVE_POST,
        payload: {
          community: group,
          post: post,
          comments: comments,
        },
      })
    }
  }, [data])

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

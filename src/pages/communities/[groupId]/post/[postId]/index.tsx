import React, { useEffect } from 'react'
import { Post } from '@/lib/post'
import WithStandardLayout from '@components/HOC/WithStandardLayout'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { PostPage } from '@components/PostPage'
import { ethers } from 'ethers'
import useSWR from 'swr'
import fetcher, { getGroupWithPostAndCommentData } from '@/lib/fetcher'
import { useRouter } from 'next/router'
import LoadingComponent from '@components/LoadingComponent'
import { CommentClass } from '@/lib/comment'

function PostIndex() {
  const { dispatch } = useCommunityContext()
  const router = useRouter()
  const { groupId, postId } = router.query

  const { data, error, isLoading } = useSWR(getGroupWithPostAndCommentData(groupId, postId), fetcher)

  useEffect(() => {
    const { group, post, comments } = data || {}
    if (!group || !post || !comments) return
    dispatch({
      type: 'SET_ACTIVE_COMMUNITY',
      payload: {
        community: group,
        postList: [post],
      },
    })
    dispatch({
      type: 'SET_ACTIVE_POST',
      payload: {
        community: group,
        post: post,
        comments: comments,
      },
    })
  }, [data])

  if (error) return <div>Error: {error.message}</div>
  if (!data || isLoading) return <LoadingComponent />

  const { group, post, comments } = data
  const postInstance = new Post(post.id, group.groupId)
  const commentInstance = new CommentClass(group.groupId, post.id, null)
  group.id = ethers.BigNumber.from(group.id)

  return (
    <PostPage
      kind={post.kind}
      postId={post.id}
      groupId={group.groupId}
      postInstance={postInstance}
      post={post}
      community={group}
      comments={comments}
      commentInstance={commentInstance}
    />
  )
}

export default WithStandardLayout(PostIndex)

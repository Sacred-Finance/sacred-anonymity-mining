import React, { useEffect } from 'react'
import { Post } from '@/lib/post'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { PostPage } from '@components/Post/PostPage'
import { ethers } from 'ethers'
import useSWR from 'swr'
import fetcher, { getGroupWithPostAndCommentData } from '@/lib/fetcher'
import { useRouter } from 'next/router'
import LoadingComponent from '@components/LoadingComponent'
import { CommentClass } from '@/lib/comment'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import Head from 'next/head'
import { app } from '@/appConfig'

function PostIndex() {
  const { dispatch } = useCommunityContext()
  const router = useRouter()
  const { groupId, postId } = router.query

  const { data, error, isLoading } = useSWR(getGroupWithPostAndCommentData(groupId, postId), fetcher)
  useCheckIfUserIsAdminOrModerator(true)

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
  const logoCID = group?.groupDetails?.logoCID
  const ogImage = logoCID ? `https://ipfs.io/ipfs/${logoCID}` : app.image
  return (
    <div>
      <Head key={ogImage}>
        <title>{group.name}</title>
        <meta property="og:title" content={post.title} />
        <meta property="og:url" content={location.href} />
        <meta property="og:description" content={post.title} />
        <meta property="og:image" content={ogImage} />
      </Head>
      <PostPage
        postInstance={postInstance}
        post={post}
        community={group}
        comments={comments}
        commentInstance={commentInstance}
      />
    </div>
  )
}

export default PostIndex

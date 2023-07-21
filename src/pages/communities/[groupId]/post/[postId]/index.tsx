import React, { useEffect, useRef } from 'react'
import { Post } from '@/lib/post'
import { CommunityPage } from '@components/CommunityPage'
import WithStandardLayout from '@components/HOC/WithStandardLayout'
import { augmentGroupData, augmentItemData } from '@/utils/communityUtils'
import { forumContract } from '@/constant/const'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { PostList } from '@/components/postList'
import { PostListProvider } from '@/contexts/PostListProvider'
import { PostPage } from '@components/PostPage'
import {ethers} from "ethers";

export async function getStaticProps({ params }) {
  const { groupId, postId } = params

  try {
    const rawGroupData = await forumContract.groupAt(groupId)
    const group = await augmentGroupData(rawGroupData)

    group.posts = group.posts.filter(post => post.toString() === postId.toString())
    const rawPostData = await Promise.all(group.posts.map(postId => forumContract.itemAt(postId)))
    const posts = await Promise.all(rawPostData.map(rawPost => augmentItemData(rawPost)))
    const childIds = posts.map(rawPost => rawPost.childIds).flat()

    const rawChildData = await Promise.all(childIds.map(childId => forumContract.itemAt(childId)))
    const comments = await Promise.all(rawChildData.map(rawPost => augmentItemData(rawPost)))

    return {
      props: {
        group,
        posts,
        comments,
        postId,
      },
      revalidate: 60,
    }
  } catch (e) {
    console.error('the error', e)
    return { props: { error: 'An error occurred while fetching post data' } }
  }
}

// statically generate all paths for all groups in the forum
export const getStaticPaths = async () => {
  const groupCount = await forumContract.groupCount()
  const groupIds = Array.from({ length: groupCount.toNumber() }, (_, i) => i)

  const rawGroupData = await Promise.all(groupIds.map(groupId => forumContract.groupAt(groupId)))
  const groups = await Promise.all(rawGroupData.map(rawGroupData => augmentGroupData(rawGroupData, true)))
  const groupPostIds = groups.map(group => group.posts.map(postId => ({ groupId: group.groupId, postId }))).flat()
  return {
    paths: groupPostIds.map(({ groupId, postId }) => ({
      params: { groupId: groupId.toString(), postId: postId.toString() },
    })),
    fallback: 'blocking',
  }
}

function PostIndex({ group, postId, error, posts, comments }) {
  if (error) {
    return <div>Error: {error}</div>
  }
  const { dispatch } = useCommunityContext()

  useEffect(() => {
    if (!group) return
    dispatch({ type: 'ADD_COMMUNITY', payload: group })
  }, [group])

  const groupId = group.groupId
  group.id =  ethers.BigNumber.from(group.id).toNumber()

  const postInstance = new Post(postId, groupId.toString())
  return (
    <CommunityPage community={group} posts={posts} post={posts[0]} postId={postId} postInstance={postInstance as Post}>
      <PostPage postInstance={postInstance} postId={postId} groupId={groupId} />
    </CommunityPage>
  )
}

export default WithStandardLayout(PostIndex)

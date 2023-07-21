import React, { useEffect, useRef } from 'react'
import { Post } from '@/lib/post'
import LoadingPage from '@components/LoadingComponent'
import { useMounted } from '@/hooks/useMounted'
import { CommunityPage } from '@components/CommunityPage'
import WithStandardLayout from '@components/HOC/WithStandardLayout'
import { useLoaderContext } from '@/contexts/LoaderContext'
import { augmentGroupData, augmentItemData } from '@/utils/communityUtils'
import { forumContract } from '@/constant/const'
import type { Group } from '@/types/contract/ForumInterface'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import {ethers} from "ethers";

export const getStaticProps = async context => {
  const { groupId } = context.params

  try {
    const rawGroupData = await forumContract.groupAt(groupId)
    const group = await augmentGroupData(rawGroupData)
    const rawPostData = await Promise.all(group.posts.map(postId => forumContract.itemAt(postId)))
    const posts = await Promise.all(rawPostData.map(rawPost => augmentItemData(rawPost))) // replace `augmentPostData` with your actual function for post data

    return {
      props: {
        group: group,
        posts: posts,
      },
      revalidate: 60,
    }
  } catch (e) {
    console.error(e)
    return { props: { error: 'An error occurred while fetching group data' } }
  }
}

// statically generate all paths for all groups in the forum
export const getStaticPaths = async () => {
  const groupCount = await forumContract.groupCount()
  const groups = Array.from({ length: groupCount.toNumber() }, (_, i) => i)
  return {
    paths: groups.map(groupId => ({
      params: { groupId: groupId.toString() }, // convert groupId to string for params
    })),
    fallback: 'blocking',
  }
}

function Group({ group, posts, error }) {
    if (error) {
    return <div>Error: {error}</div>
    }
  const isMounted = useMounted()
  const { isLoading } = useLoaderContext()

  const { dispatch, state } = useCommunityContext()

  useEffect(() => {
    if (!group) return
    dispatch({ type: 'ADD_COMMUNITY', payload: group })

  }, [group])

  const postInstance = new Post(undefined, group.groupId.toString())

  group.id =  ethers.BigNumber.from(group.id).toNumber()

  return <CommunityPage community={group} posts={posts} postId={undefined} postInstance={postInstance as Post} />
}

export default WithStandardLayout(Group)

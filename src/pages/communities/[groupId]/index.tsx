import React, { useEffect } from 'react'
import { Post } from '@/lib/post'
import LoadingPage from '@components/LoadingComponent'
import { CommunityPage } from '@components/CommunityPage'
import WithStandardLayout from '@components/HOC/WithStandardLayout'
import { useLoaderContext } from '@/contexts/LoaderContext'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { ethers } from 'ethers'
import useSWR, { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'
import fetcher, { getGroupWithPostData } from '@/lib/fetcher'

function Group() {
  const router = useRouter()
  const { groupId, postId } = router.query
  const { data, error, isValidating } = useSWR(getGroupWithPostData(groupId), fetcher)
  const { dispatch } = useCommunityContext()

  useEffect(() => {
    if (data && !isValidating && !error && !data?.error) {
      dispatch({
        type: 'SET_ACTIVE_COMMUNITY',
        payload: {
          community: data.group,
          posts: data.posts,
        },
      })
      dispatch({
        type: 'SET_USERS',
        payload: data?.users
      })
    }
  }, [data?.group, data?.posts, data?.users, isValidating])

  if (error) return <div>Error: {error.message}</div>
  if (!data) return <LoadingPage />

  const { group, posts } = data

  group.id = ethers.BigNumber.from(group.id)

  const postInstance = group && new Post(undefined, group.groupId.toString())

  return <CommunityPage community={group} posts={posts} postId={postId as string} postInstance={postInstance as Post} />
}

export default WithStandardLayout(Group)

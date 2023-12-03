import React, { useEffect } from 'react'
import LoadingPage from '@components/LoadingComponent'
import { CommunityPage } from '@components/CommunityPage'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { ethers } from 'ethers'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import fetcher, { getGroupWithPostData } from '@/lib/fetcher'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import Head from 'next/head'
import { app } from '@/appConfig'

function Group() {
  const router = useRouter()
  const { groupId, postId } = router.query
  const { data, error, isValidating } = useSWR(getGroupWithPostData(groupId), fetcher)
  const { dispatch } = useCommunityContext()
  const [ogImage, setOgImage] = React.useState(`${app.image}`)
  useCheckIfUserIsAdminOrModerator(true)

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
        payload: data?.users,
      })
      if (data?.group?.groupDetails?.logoCID) {
        setOgImage(`https://ipfs.io/ipfs/${data?.group?.groupDetails?.logoCID}`)
      }
    }
  }, [data?.group, data?.posts, data?.users, isValidating])
  if (error) return <div>Error: {error.message}</div>
  if (!data) return <LoadingPage />

  const { group, posts } = data

  group.id = ethers.BigNumber.from(group.id)

  return (
    <div>
      <Head>
        <title>{group.name}</title>
        <meta property="og:title" content={group.name} />
        <meta property="og:url" content={location.origin} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:description" content={group?.groupDetails?.description} />
      </Head>
      <CommunityPage community={group} posts={posts} />
    </div>
  )
}

export default Group

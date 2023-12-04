import React, { useEffect, useState } from 'react'
import LoadingPage from '@components/LoadingComponent'
import { CommunityPage } from '@components/CommunityPage'
import { ActionType, useCommunityContext } from '@/contexts/CommunityProvider'
import { ethers } from 'ethers'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import fetcher, { getGroupWithPostData } from '@/lib/fetcher'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import Head from 'next/head'
import { app } from '@/appConfig'

function Group() {
  const router = useRouter()
  const { groupId } = router.query
  const { data, error, isValidating } = useSWR(getGroupWithPostData(groupId), fetcher)
  const { dispatch } = useCommunityContext()
  const [ogImage, setOgImage] = useState(app.image)
  useCheckIfUserIsAdminOrModerator(true)

  const { group, posts, users } = data || {}

  useEffect(() => {
    if (data && !isValidating && !error && !data?.error) {
      dispatch({
        type: ActionType.SET_ACTIVE_COMMUNITY,
        payload: {
          community: group,
          posts,
        },
      })
      dispatch({
        type: ActionType.SET_USERS,
        payload: users,
      })
      if (group?.groupDetails?.logoCID) {
        setOgImage(`https://ipfs.io/ipfs/${group?.groupDetails?.logoCID}`)
      }
    }
  }, [group, posts, users, isValidating])
  if (error) return <div>Error: {error.message}</div>
  if (!data) return <LoadingPage />

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

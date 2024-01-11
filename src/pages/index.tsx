import { BigNumber } from 'ethers'
import HomePage from '../components/HomePage'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import useSWR from 'swr'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import Head from 'next/head'
import { Syncing } from '@/components/Syncing'
import type { Group } from '@/types/contract/ForumInterface'
import { ActionType } from "@/contexts/CommunityTypes";

function Home() {
  const router = useRouter()
  const pageRef = React.useRef<HTMLDivElement>(null)
  const { dispatch } = useCommunityContext()

  const { isAdminOrModerator } = useCheckIfUserIsAdminOrModerator(true)

  useEffect(() => {
    if (pageRef.current) {
      pageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [router.pathname])

  const { data, error, isLoading, isValidating } = useSWR('/api/data')
  useEffect(() => {
    if (!data) {
      return
    }
    const { communitiesData, users } = data

    if (!communitiesData || !users) {
      return
    }
    console.log('data', data)

    dispatch({
      type: ActionType.SET_COMMUNITIES,
      payload: communitiesData.map((c: Group) => ({
        ...c,
        id: BigNumber.from(c.id),
      })),
    })

    dispatch({
      type: ActionType.SET_USERS,
      payload: users,
    })
  }, [data, dispatch])

  if (error) {
    return <div>Error: {error.message}</div>
  }
  return (
    <div>
      <Head>
        <title>Sacred Logos</title>
        <meta property="og:title" content="Sacred Logos" key="title" />
        <meta property="og:url" content={location.href} />
      </Head>
      {isValidating && <Syncing />}
      <HomePage
        isLoading={isLoading}
        isValidating={isValidating}
        isAdmin={!!isAdminOrModerator}
      />
    </div>
  )
}

// export const getServerSideProps = async () => {
//   const data = await axios.get(
//     process.env.NEXT_PUBLIC_DISCOURSE_GOOGLE_SHEET_API_URL as string
//   )
//   return {
//     props: {
//       discourseCommunities: data.data?.communities,
//     },
//   }
// }

export default Home

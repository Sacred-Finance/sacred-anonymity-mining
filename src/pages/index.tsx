import { BigNumber } from 'ethers'
import HomePage from '../components/HomePage'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import useSWR from 'swr'
import { ActionType, useCommunityContext } from '@/contexts/CommunityProvider'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import Head from 'next/head'

function Home({ discourseCommunities }) {
  const router = useRouter()
  const pageRef = React.useRef(null)
  const {
    state: { isAdmin, isModerator },
  } = useCommunityContext()
  useCheckIfUserIsAdminOrModerator(true)

  useEffect(() => {
    if (pageRef.current) {
      pageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [router.pathname])

  const { data, error, isLoading, isValidating } = useSWR('/api/data')
  const { dispatch } = useCommunityContext()

  useEffect(() => {
    if (!data) return
    const { communitiesData, users } = data

    if (!communitiesData || !users) return
    // convert id back to bignumber
    dispatch({
      type: ActionType.SET_COMMUNITIES,
      payload: communitiesData.map(c => ({ ...c, id: BigNumber.from(c.id) })),
    })

    dispatch({
      type: ActionType.SET_USERS,
      payload: users,
    })
  }, [data])

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
      <HomePage
        isLoading={isLoading || isValidating}
        isAdmin={isAdmin || isModerator || false}
        discourseCommunities={discourseCommunities}
      />
    </div>
  )
}

export const getServerSideProps = async () => {
  const data = await axios.get(process.env.NEXT_PUBLIC_DISCOURSE_GOOGLE_SHEET_API_URL as string)
  return {
    props: {
      discourseCommunities: data.data?.communities,
    },
  }
}

export default Home

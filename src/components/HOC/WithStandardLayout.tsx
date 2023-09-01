import React, { useEffect } from 'react'
import Header from '@components/Header'
import { Breadcrumbs } from '@components/Breadcrumbs'
import Footer from '@components/Footer'
import { useRouter } from 'next/router'
import useSWR from "swr";
import {useCommunityContext} from "@/contexts/CommunityProvider";
import {BigNumber} from "ethers";
import LoadingComponent from "@components/LoadingComponent";

export default function WithStandardLayout(WrappedComponent, additionalProps = {}) {
  const WithStandardLayout: (props) => JSX.Element = props => {
    const pageRef = React.useRef(null)
    const router = useRouter()
    useEffect(() => {
      if (pageRef.current) {
        pageRef.current.scrollIntoView({ behavior: 'smooth' })
          console.log('scrolling to top')
      }
    }, [router.pathname])

      const { data, error } = useSWR('/api/data')
      const { dispatch } = useCommunityContext()

      useEffect(() => {
          if (!data) return
          const { communitiesData } = data
          // convert id back to bignumber
          dispatch({ type: 'SET_COMMUNITIES', payload: communitiesData.map(c => ({ ...c, id: BigNumber.from(c.id) })) })
          // dispatch({
          //     type: 'SET_USERS',
          //     payload: users,
          // })
      }, [data])

      if (error) {
          return <div>Error: {error.message}</div>
      }
      if (!data) {
          return <LoadingComponent/>
      }



    return (
      <div className={'flex h-screen flex-col'} ref={pageRef}>
        <Header />
        <Breadcrumbs />
        <div>
          <WrappedComponent {...props} {...additionalProps} {...data}  />
        </div>
        <div className={'flex-1'} />
        <div className={'relative'}>
          <Footer />
        </div>
      </div>
    )
  }

  return WithStandardLayout
}

import React, { useEffect, useRef, useState } from 'react'
import Header from '@components/Header'
import { Breadcrumbs } from '@components/Breadcrumbs'
import Footer from '@components/Footer'
import { useRouter } from 'next/router'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { BigNumber } from 'ethers'
import LoadingComponent from '@components/LoadingComponent'
import SideBar from '@components/SideBar'
import useSWR, { preload } from 'swr'
const fetcher = (url) => fetch(url).then((res) => {
  console.log('fetching data')
    return res.json()
})

preload('/api/data', fetcher)


export default function StandardLayout({ children }) {
  const pageRef = useRef(null)
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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
    const { communitiesData, users } = data
    if (!communitiesData || !users) return
    // convert id back to bignumber
    dispatch({ type: 'SET_COMMUNITIES', payload: communitiesData.map(c => ({ ...c, id: BigNumber.from(c.id) })) })
    dispatch({
      type: 'SET_USERS',
      payload: users,
    })
  }, [data])

  if (error) {
    return <div>Error: {error.message}</div>
  }
  if (!data) {
    return <LoadingComponent />
  }

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { ...data })
    }
    return child
  })

  return (
    <div className={'flex h-full flex-col '} ref={pageRef}>
      <div className={'flex w-full flex-col '} ref={pageRef}>
        <Header />
        <Breadcrumbs />
        <div className={'relative flex flex-1 '}>
          <div className={'relative  '}>
            <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
          </div>
          <div className="w-full border p-2 h-full">{childrenWithProps}</div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

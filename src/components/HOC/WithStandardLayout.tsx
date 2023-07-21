import React, { useEffect } from 'react'
import Header from '@components/Header'
import { Breadcrumbs } from '@components/Breadcrumbs'
import Footer from '@components/Footer'
import { useRouter } from 'next/router'

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
    return (
      <div className={'flex h-screen flex-col'} ref={pageRef}>
        <Header />
        <Breadcrumbs />
        <div>
          <WrappedComponent {...props} {...additionalProps} />
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

import React from 'react'
import Header from '@components/Header'
import { Breadcrumbs } from '@components/Breadcrumbs'
import Footer from '@components/Footer'

export default function WithStandardLayout(WrappedComponent, additionalProps = {}) {

  const WithStandardLayout: (props) => JSX.Element = props => (
    <div className={'flex h-screen flex-col'}>
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

  return WithStandardLayout
}

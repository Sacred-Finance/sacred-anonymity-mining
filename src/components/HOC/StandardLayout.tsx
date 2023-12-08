import React from 'react'
import Header from '@components/Header'
import { Breadcrumbs } from '@components/Breadcrumbs'
import Footer from '@components/Footer'

// preload('/api/data', fetcher)

export default function StandardLayout({ children }) {
  return (
    <div className={'flex h-full min-h-screen flex-col justify-between'}>
      <div>
        <Header />
        <Breadcrumbs />
        <div className="border-t">
          <div className="bg-background">
            <div className="h-full px-4 py-6 lg:px-8">{children}</div>
          </div>
        </div>
      </div>
      <div className=" flex h-full grow flex-col" />
      <Footer />
    </div>
  )
}

import React from 'react'
import Header from '@components/Header'
import { Breadcrumbs } from '@components/Breadcrumbs'
import Footer from '@components/Footer'
import SideBar from '@components/SideBar'

// preload('/api/data', fetcher)

export default function StandardLayout({ children }) {
  return (
    <div className={'flex h-full flex-col '}>
      <Header /> <Breadcrumbs />
      <div className="border-t">
        <div className="bg-background">
          <div className="grid lg:grid-cols-6">
            <SideBar className="hidden lg:block" />
            <div className="col-span-3 lg:col-span-5 lg:border-l">
              <div className="h-full px-4 py-6 lg:px-8">{children}</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

import type { ReactNode } from 'react'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { BreadcrumbArrow } from '@/icons/BreadcrumbArrow'
import { generateBreadcrumbItems } from '@components/breadcrumb/Breadcrumb.utils'

interface BreadCrumbItem {
  label: ReactNode | string
  href: string
  isCurrentPage: boolean
  hidden?: boolean
}

function useBreadcrumbs(): BreadCrumbItem[] {
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadCrumbItem[]>([])
  const router = useRouter()
  const { state } = useCommunityContext()

  useEffect(() => {
    const { activeCommunity, activePost } = state
    if (!activeCommunity?.community || !activePost?.post) {
      setBreadcrumbItems([])
      return
    }
    setBreadcrumbItems(
      generateBreadcrumbItems({
        community: activeCommunity.community,
        post: activePost.post,
        pathname: router.pathname,
      })
    )
  }, [state, router.pathname])

  return breadcrumbItems
}

export const Breadcrumbs = (): JSX.Element => {
  const breadcrumbItems = useBreadcrumbs()

  return (
    <nav
      className="flex h-10 justify-between gap-4 rounded-t px-5 py-3 text-gray-700"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-4 dark:text-white">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="inline-flex items-center gap-4">
            <BreadcrumbLink item={item} />
            {!item.isCurrentPage && <BreadcrumbArrow />}
          </li>
        ))}
      </ol>
    </nav>
  )
}

const BreadcrumbLink = ({ item }: { item: BreadCrumbItem }) => {
  return (
    <Link
      href={item.href}
      onClick={e => {
        if (item.isCurrentPage) {
          e.preventDefault()
        }
      }}
      className={clsx(
        item.isCurrentPage ? 'text-primary' : 'hover:text-primary/90'
      )}
    >
      {item.label}
    </Link>
  )
}

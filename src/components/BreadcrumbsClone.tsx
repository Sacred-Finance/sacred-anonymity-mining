import React, { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { CircularLoader } from '@components/buttons/JoinCommunityButton'
import { useRouter } from 'next/router'

function useBreadcrumbs(): BreadCrumbItem[] {
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadCrumbItem[]>([])

  const router = useRouter()
  const { state } = useCommunityContext()

  const community = state.activeCommunity.community
  const post = state.activePost.post

  useEffect(() => {
    if (!community || !post) {
      setBreadcrumbItems([])
      return
    }
    const items = generateBreadcrumbItems(community, post, location)
    setBreadcrumbItems(items)
  }, [community, post, router])

  return breadcrumbItems
}

export const Breadcrumbs = ({ backdrop = false }): JSX.Element => {
  const breadcrumbItems = useBreadcrumbs()

  return (
    <nav className="flex justify-between gap-4 rounded-t px-5 py-3 text-gray-700 " aria-label="Breadcrumb">
      <ol className="flex items-center gap-4 dark:text-white">
        {breadcrumbItems?.map((item, index) => {
          if (!item) return null
          return (
            <li key={index} className="inline-flex items-center gap-4">
              <Link
                href={item.href}
                onClick={e => {
                  if (item.isCurrentPage) {
                    e.preventDefault()
                  }
                }}
                className={item.isCurrentPage ? '' : 'text-primary-600 hover:text-primary-700'}
              >
                {item.label}
              </Link>
              {item.isCurrentPage ? null : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
const elipsis = (text, length) => {
  if (text?.length > length) {
    return text.substring(0, length) + '...'
  } else {
    return text
  }
}

interface BreadCrumbItem {
  label: ReactNode | string
  href: string
  isCurrentPage: boolean
  hidden?: boolean
}

function generateBreadcrumbItems(community, post, location): BreadCrumbItem[] {
  let items: BreadCrumbItem[] = []

  const communityLabel = elipsis(community?.name, 50) ?? <CircularLoader className={'text-white'} />

  const postLabel = elipsis(post.title, 20) ?? <CircularLoader className={'text-white'} />

  if (location.pathname === '/') {
    items = [{ label: 'Home', href: '/', isCurrentPage: true, hidden: true }]
  } else if (location.pathname.includes('/post/')) {
    items = [
      { label: 'Home', href: '/', isCurrentPage: false },
      {
        label: communityLabel,
        href: `/communities/${community?.id}`,
        isCurrentPage: false,
      },
      {
        label: postLabel,
        href: `/communities/${community?.id}/post/${post.id}`,
        isCurrentPage: true,
      },
    ]
  } else if (location.pathname.includes('/communities/')) {
    items = [
      { label: 'Home', href: '/', isCurrentPage: false },
      {
        label: communityLabel,
        href: `/communities/${community?.id}`,
        isCurrentPage: true,
      },
    ]
  } else if (location.pathname.includes('access')) {
    items = [
      { label: 'Home', href: '/', isCurrentPage: false },
      {
        label: 'Access',
        href: `/access`,
        isCurrentPage: true,
      },
    ]
  } else if (location.pathname.includes('create-group')) {
    items = [
      { label: 'Home', href: '/', isCurrentPage: false },
      {
        label: 'Create Group',
        href: `/create-group`,
        isCurrentPage: true,
      },
    ]
  } else if (location.pathname.includes('discourse')) {
    items = [
      { label: 'Home', href: '/', isCurrentPage: false },
      {
        label: 'Discourse',
        href: `/discourse/${community.fancy_title}`,
        isCurrentPage: true,
      },
    ]
  }

  return items
}

import React, { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useCommunityById, useCommunityContext } from '@/contexts/CommunityProvider'
import { CircularProgress } from './CircularProgress'
import { CircularLoader } from '@components/JoinCommunityButton'

function useBreadcrumbs(): BreadCrumbItem[] {
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadCrumbItem[]>([])

  const { state } = useCommunityContext()

  const router = useRouter()

  const { groupId, postId } = router.query

  const community = state.activeCommunity.community
  const post = state.activePost.post

  useEffect(() => {
    if (!community || !post) return
    const items = generateBreadcrumbItems(community, post, location)
    setBreadcrumbItems(items)
  }, [community, post])

  return breadcrumbItems
}

export const Breadcrumbs = ({ backdrop = false }): JSX.Element => {
  const breadcrumbItems = useBreadcrumbs()

  return (
    <nav
      className="flex justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-5 py-3 text-gray-700 dark:border-gray-700 dark:bg-gray-800"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-5">
        {breadcrumbItems?.map((item, index) => {
          if (!item) return null
          return (
            <li key={index} className="inline-flex items-center gap-5">
              <Link
                href={item.href}
                className={` inline-flex items-center rounded border px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-400 dark:hover:text-white ${
                  item.isCurrentPage ? 'bg-primary-500 font-bold text-white hover:bg-primary-700 ' : 'hover:bg-white/80'
                }`}
                onClick={e => {
                  if (item.isCurrentPage) {
                    e.preventDefault()
                  }
                }}
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

  // const postLabel = elipsis(post.title, 20) ?? <CircularProgress className={'h-5 w-5 text-white'} />
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
  }

  return items
}

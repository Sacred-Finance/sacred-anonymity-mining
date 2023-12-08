import type { ReactNode } from 'react'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { CircularLoader } from '@components/buttons/JoinCommunityButton'
import { useRouter } from 'next/router'
import clsx from 'clsx'

interface BreadCrumbItem {
  label: ReactNode | string
  href: string
  isCurrentPage: boolean
  hidden?: boolean
}

const HOME_BREADCRUMB = { label: 'Home', href: '/', isCurrentPage: false }

function useBreadcrumbs(): BreadCrumbItem[] {
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadCrumbItem[]>([])
  const router = useRouter()
  const { state } = useCommunityContext()

  useEffect(() => {
    const { activeCommunity, activePost } = state
    if (!activeCommunity.community || !activePost.post) {
      setBreadcrumbItems([])
      return
    }
    setBreadcrumbItems(
      generateBreadcrumbItems(
        activeCommunity.community,
        activePost.post,
        router.pathname
      )
    )
  }, [state, router.pathname])

  return breadcrumbItems
}

export const Breadcrumbs = (): JSX.Element => {
  const breadcrumbItems = useBreadcrumbs()

  return (
    <nav
      className="flex justify-between gap-4 rounded-t px-5 py-3 text-gray-700"
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
  if (!item) {
    return null
  }

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

const BreadcrumbArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-4 w-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
)

const elipsis = (text, length) => {
  return text?.length > length ? `${text.substring(0, length)}...` : text
}

function generateBreadcrumbItems(community, post, pathname): BreadCrumbItem[] {
  const communityLabel = elipsis(community?.name, 50) ?? (
    <CircularLoader className={'text-white'} />
  )
  const postLabel = elipsis(post.title, 20) ?? (
    <CircularLoader className={'text-white'} />
  )

  const items = [HOME_BREADCRUMB] // Default breadcrumb item

  if (pathname === '/') {
    return [{ ...HOME_BREADCRUMB, isCurrentPage: true }]
  } else if (pathname.includes('/post/')) {
    items.push(
      {
        label: communityLabel,
        href: `/communities/${community?.id}`,
        isCurrentPage: false,
      },
      {
        label: postLabel,
        href: `/communities/${community?.id}/post/${post.id}`,
        isCurrentPage: true,
      }
    )
  } else if (pathname.includes('/communities/')) {
    items.push({
      label: communityLabel,
      href: `/communities/${community?.id}`,
      isCurrentPage: true,
    })
  } else if (pathname.includes('/access')) {
    items.push({ label: 'Access', href: '/access', isCurrentPage: true })
  } else if (pathname.includes('/account')) {
    items.push({ label: 'Account', href: '/account', isCurrentPage: true })
  } else if (pathname.includes('/create-group')) {
    items.push({
      label: 'Create Group',
      href: '/create-group',
      isCurrentPage: true,
    })
  } else if (pathname.includes('/discourse')) {
    items.push({
      label: 'Discourse',
      href: `/discourse/${community?.fancy_title}`,
      isCurrentPage: true,
    })
  }

  return items
}

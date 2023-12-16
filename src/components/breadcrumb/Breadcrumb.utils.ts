import type { Group, Item } from '@/types/contract/ForumInterface'
import type { DiscourseCommunity } from '@/lib/model'
import type { ReactNode } from 'react'

export interface BreadCrumbItem {
  label: ReactNode | string
  href: string
  isCurrentPage: boolean
  hidden?: boolean
}

export interface GenerateBreadcrumbItemsParams {
  community: Group | DiscourseCommunity
  post: Item
  pathname: string
}
const HOME_BREADCRUMB = { label: 'Home', href: '/', isCurrentPage: false }

// Breadcrumb.utils.ts
export const generateBreadcrumbItems = ({
  community,
  post,
  pathname,
}: GenerateBreadcrumbItemsParams): BreadCrumbItem[] => {
  // Default breadcrumb item
  const items: BreadCrumbItem[] = [{ ...HOME_BREADCRUMB }]

  if (pathname === '/') {
    return [{ ...HOME_BREADCRUMB, isCurrentPage: true }]
  }

  // Community and Post labels
  let communityLabel = 'Community'
  let postLabel = 'Post'

  if ('name' in community) {
    communityLabel = community.name // Assuming community has a 'name' property
  }

  if ('title' in post) {
    postLabel = post.title as string // Assuming post has a 'title' property
  }

  // Path-specific breadcrumbs
  if (pathname.includes('/post/')) {
    items.push(
      {
        label: communityLabel,
        href: `/communities/${community.id}`, // Assuming community has an 'id' property
        isCurrentPage: false,
      },
      {
        label: postLabel,
        href: `/communities/${community.id}/post/${post.id}`, // Assuming post has an 'id' property
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
  } else if (pathname.includes('/discourse') && 'fancy_title' in community) {
    items.push({
      label: 'Discourse',
      href: `/discourse/${community?.fancy_title}`,
      isCurrentPage: true,
    })
  }

  return items
}

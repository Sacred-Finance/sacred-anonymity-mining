import React, { ReactNode, useEffect, useState } from 'react'
import { Post as PostClass } from '../lib/post'
import useSWR from 'swr'
import { ForumContractAddress } from '../constant/const'
import ForumABI from '../constant/abi/Forum.json'
import { polygonMumbai } from 'wagmi/chains'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useCommunityById, useCommunityContext } from '../contexts/CommunityProvider'
import { getContract } from '@wagmi/core'
import { CircularProgress } from './CircularProgress'
import { useContract, useProvider } from 'wagmi'

function useBreadcrumbs(): BreadCrumbItem[] {
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadCrumbItem[]>([])

  const router = useRouter()
  const { groupId, postId } = router.query
  const { community, postFetched, isValidating } = useCommunityAndPost(groupId, postId)

  useEffect(() => {
    const items = generateBreadcrumbItems(community, postFetched, isValidating, location)
    setBreadcrumbItems(items)
  }, [groupId, postId, community, postFetched, isValidating])

  return breadcrumbItems
}

export const Breadcrumbs = ({ backdrop = false }): JSX.Element => {
  const breadcrumbItems = useBreadcrumbs()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleNavigation = (e, href) => {
    e.preventDefault()
    router.push(href)
  }

  return (
    <nav
      className="flex rounded-lg border border-gray-200 bg-gray-50 px-5 py-3 text-gray-700 dark:border-gray-700 dark:bg-gray-800"
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbItems?.map((item, index) => {
          if (!item) return null
          return (
            <li key={index} className="inline-flex items-center">
              <Link
                href={item.href}
                className={`inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white ${
                  item.isCurrentPage ? 'font-bold' : ''
                }`}
                onClick={e => handleNavigation(e, item.href)}
              >
                <svg
                  aria-hidden="true"
                  className="mr-2 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M10.707 3.293a1 1 0 010 1.414L7.414 9H13a7 7 0 110 14H7a9 9 0 100-18h6.586l-3.293 3.293a1 1 0 11-1.414-1.414l5-5z"
                    fillRule="evenodd"
                  />
                </svg>
                {item.label}
              </Link>
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

function generateBreadcrumbItems(community, postFetched, isValidating, location): BreadCrumbItem[] {
  let items: BreadCrumbItem[] = []

  const communityLabel = elipsis(community?.name, 50) ?? <CircularProgress className={'h-5 w-5'} />

  const postLabel =
    postFetched && !isValidating ? elipsis(postFetched?.title, 20) : <CircularProgress className={'h-5 w-5'} />

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
        href: `/communities/${community?.id}/post/${postFetched?.id}`,
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

function useCommunityAndPost(communityId, postId) {
  const community = useCommunityById(+communityId)

  const provider = useProvider({ chainId: polygonMumbai.id })
  const forumContract = useContract({
    address: ForumContractAddress,
    abi: ForumABI.abi,
    signerOrProvider: provider,
  })

  const postClassInstance = new PostClass(postId, communityId)

  async function fetchPost() {
    return await postClassInstance.get()
  }

  const { data: postFetched, isValidating } = useSWR(postClassInstance.postCacheId(), postId ? fetchPost : null, {
    revalidateOnFocus: false,
  })

  return { community, postFetched, isValidating }
}

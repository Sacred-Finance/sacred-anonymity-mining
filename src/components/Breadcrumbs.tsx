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
  const { id, postId } = router.query
  const { community, postFetched, isValidating } = useCommunityAndPost(id, postId)

  useEffect(() => {
    const items = generateBreadcrumbItems(community, postFetched, isValidating, location)
    setBreadcrumbItems(items)
  }, [id, postId, community, postFetched, isValidating])

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
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
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

  const communityLabel = elipsis(community?.name, 50) ?? <CircularProgress />

  const postLabel = postFetched && !isValidating ? elipsis(postFetched?.title, 20) : <CircularProgress />

  if (location.pathname === '/') {
    items = [{ label: 'Home', href: '/', isCurrentPage: true, hidden: true }]
  } else if (location.pathname.includes('/posts/')) {
    items = [
      { label: 'Home', href: '/', isCurrentPage: false },
      {
        label: communityLabel,
        href: `/communities/${community?.id}`,
        isCurrentPage: false,
      },
      {
        label: postLabel,
        href: `/communities/${community?.id}/posts/${postFetched?.id}`,
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

  const postClassInstance = new PostClass(postId, communityId, forumContract, provider)

  async function fetchPost() {
    return await postClassInstance.get()
  }

  const { data: postFetched, isValidating } = useSWR(postClassInstance.postCacheId(), postId ? fetchPost : null, {
    revalidateOnFocus: false,
  })

  return { community, postFetched, isValidating }
}

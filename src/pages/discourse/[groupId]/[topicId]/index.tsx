import React, { useEffect, useState } from 'react'
import WithStandardLayout from '@components/HOC/WithStandardLayout'
import { useRouter } from 'next/router'
import TopicPosts from '@components/Discourse/TopicPosts'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import fetcher from '@/lib/fetcher'
import PostToTopic from '@components/Discourse/PostToTopic'
import { Pagination } from '@components/Pagination'
import useSWR from 'swr'
import { Topic } from '@components/Discourse/types'
import { DiscourseCommunityBanner } from '..'
import { useFetchMetadata } from '@/hooks/discourse/useFetchMetadata'

const PAGE_SIZE = 20

const Index = () => {
  const router = useRouter()
  const { groupId, topicId } = router.query
  const { dispatch } = useCommunityContext()
  const { community, loading } = useFetchMetadata(groupId)
  const [currentPage, setCurrentPage] = useState(1)
  const [fetchedPosts, setFetchedPosts] = useState({})

  // Initial request to get the topic data
  const { data: initialData } = useSWR(topicId ? `/api/discourse/${groupId}/${topicId}` : null, fetcher)

  const startIdx: number = (currentPage - 1) * PAGE_SIZE
  const post_ids: number[] = initialData?.post_stream.stream.slice(startIdx, startIdx + PAGE_SIZE) || []

  const { data: pageData, error } = useSWR(
    post_ids.length ? `/api/discourse/${groupId}/${topicId}/posts/${post_ids.join(',')}` : null,
    fetcher
  )

  useEffect(() => {
    if (pageData && !fetchedPosts[currentPage]) {
      setFetchedPosts({ ...fetchedPosts, [currentPage]: pageData.post_stream.posts })
    }
  }, [pageData])

  const posts = fetchedPosts[currentPage] || []

  const topic = pageData as Topic

  useEffect(() => {
    if (initialData) {
      dispatch({
        type: 'SET_ACTIVE_COMMUNITY',
        payload: {
          community: initialData,
        },
      })
    }
  }, [initialData])

  const handlePageChange = newPage => {
    setCurrentPage(newPage + 1) // Update the current page state
    // scroll to top of page
    const header = document.getElementById('header')
    if (header && newPage) {
      header.scrollIntoView({ behavior: 'auto' })
    }
  }

  const totalPages = Math.ceil(initialData?.post_stream?.stream.length / PAGE_SIZE)

  return (
    <>
      {DiscourseCommunityBanner(loading, community)}
      <div className="relative mb-10 flex flex-col content-center items-center justify-center gap-4 space-y-4">
        <PostToTopic topic={topic as Topic} />
        <Pagination currentPage={currentPage - 1} totalPages={totalPages} onPageChange={handlePageChange} />
        <div className="relative mx-auto  flex min-h-screen justify-center px-4 sm:w-full md:w-3/4 lg:w-1/2">
          <TopicPosts
            topic={{ ...topic, post_stream: { ...topic?.post_stream, posts } } as Topic}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  )
}

export default WithStandardLayout(Index)

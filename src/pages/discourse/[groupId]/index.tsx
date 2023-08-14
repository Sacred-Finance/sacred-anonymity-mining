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

const PAGE_SIZE = 20

const Index = () => {
  const router = useRouter()
  const { groupId } = router.query
  const { dispatch } = useCommunityContext()
  const [currentPage, setCurrentPage] = useState(1) // Initialize current page to 1

  // Initial request to get the topic data
  const { data: initialData } = useSWR(groupId ? `/api/discourse/${groupId}` : null, fetcher)

  // Based on current page, calculate post_ids and fetch posts
  const startIdx: number = (currentPage - 1) * PAGE_SIZE
  const post_ids: number[] = initialData?.post_stream.stream.slice(startIdx, startIdx + PAGE_SIZE) || []
  const { data: pageData, error } = useSWR(
    post_ids.length ? `/api/discourse/${groupId}/posts/${post_ids.join(',')}` : null,
    fetcher
  )

  const posts = pageData ? pageData.post_stream.posts : []
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
  }

  if (!initialData || !pageData) return <div>Loading...</div>
  if (error) return <div>An error occurred</div>

  const totalPages = Math.ceil(initialData.post_stream.stream.length / PAGE_SIZE)

  return (
    <div className="relative mb-10 flex flex-col content-center items-center justify-center gap-4 space-y-8">
      <PostToTopic topic={topic as Topic} />
      <Pagination currentPage={currentPage - 1} totalPages={totalPages} onPageChange={handlePageChange} />
      <div className="relative z-0 mx-auto flex justify-center px-4 sm:w-full md:w-3/4 lg:w-1/2">
        <TopicPosts topic={{ ...topic, post_stream: { ...topic.post_stream, posts } } as Topic} />
      </div>
    </div>
  )
}

export default WithStandardLayout(Index)

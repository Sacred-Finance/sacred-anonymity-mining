import React, { useEffect, useState } from 'react'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [fetchedPosts, setFetchedPosts] = useState({})

  // Initial request to get the topic data
  const { data: initialData } = useSWR(groupId ? `/api/discourse/${groupId}` : null, fetcher)

  const startIdx: number = (currentPage - 1) * PAGE_SIZE
  const post_ids: number[] = initialData?.post_stream.stream.slice(startIdx, startIdx + PAGE_SIZE) || []

  const { data: pageData, error } = useSWR(
    post_ids.length ? `/api/discourse/${groupId}/posts/${post_ids.join(',')}` : null,
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
    <div >
      <PostToTopic topic={topic as Topic} />
      <Pagination currentPage={currentPage - 1} totalPages={totalPages} onPageChange={handlePageChange} />
      <TopicPosts
        topic={{ ...topic, post_stream: { ...topic?.post_stream, posts } } as Topic}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default Index

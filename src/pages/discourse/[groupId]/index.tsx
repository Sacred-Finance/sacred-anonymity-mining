import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/router'
import TopicPosts from '@components/Discourse/TopicPosts'
import fetcher from '@/lib/fetcher'
import PostToTopic from '@components/Discourse/PostToTopic'
import useSWR from 'swr'
import { Post, PostStreamObject, Topic } from '@components/Discourse/types'
import clsx from 'clsx'
import _ from 'lodash'
import useSWRInfinite from 'swr/infinite'
import { motion } from 'framer-motion'

const PAGE_SIZE = 20

const Index = () => {
  const router = useRouter()
  const { groupId } = router.query
  const loaderRef = useRef(null)
  const [postIds, setPostIds] = useState<number[]>([])

  const { data: initialData } = useSWR<Topic>(
    groupId
      ? () => {
          return `/api/discourse/${groupId}`
        }
      : null,
    fetcher
  )

  useEffect(() => {
    if (initialData) {
      setPostIds(initialData.post_stream.stream)
    }
  }, [initialData])

  const { data, mutate, size, setSize, isValidating, isLoading, error } = useSWRInfinite<PostStreamObject>(
    index => {
      const postIdChunks = _.chunk(postIds, PAGE_SIZE)
      return postIds.length && postIdChunks?.[index]?.length
        ? `/api/discourse/${groupId}/posts/${postIdChunks[index].join(',')}&page=${index}`
        : null
    },
    fetcher,
    {
      revalidateFirstPage: false,
    }
  )

  if (error) {
    return <>error</>
  }
  const mutatePost = (newPost: Post) => {
    mutate(data => {
      const newData = [...data]
      const lastPage = newData[newData.length - 1]
      const lastPagePosts = lastPage?.post_stream?.posts
      if (lastPagePosts) {
        lastPagePosts.push(newPost)
      }
      return newData
    }, true)
  }

  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = data?.[0]?.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE)
  const isRefreshing = isValidating && data && data.length === size

  const topicData = _.uniqBy(
    _.merge(_.flatten(data?.map(d => d?.post_stream?.posts)), _.flatten(initialData?.post_stream?.posts)),
    'id'
  )
  return (
    <div className={clsx(' w-full max-w-screen-xl space-y-6 sm:p-8 md:p-24')}>

      <PostToTopic topic={initialData as Topic} />
      {data?.length && (
        <TopicPosts
          topic={{ ...initialData, ...data, post_stream: { ...initialData?.post_stream, posts: topicData } } as Topic}
          mutate={mutatePost}
        />
      )}
      <motion.div
        onViewportEnter={() => {
          setSize(size + 1)
        }}
        viewport={{ once: true }}
        ref={loaderRef}
      ></motion.div>

      {isReachingEnd && (
        <div className="flex items-center justify-center">
          <div className="text-gray-500">You have reached the end of this topic.</div>
        </div>
      )}
    </div>
  )
}

export default Index

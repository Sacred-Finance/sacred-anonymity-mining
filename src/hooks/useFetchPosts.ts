import { useEffect, useState } from 'react'
import useSWR, { mutate } from 'swr'
import fetcher, { getDiscourseData } from '@/lib/fetcher'

export const useFetchPosts = posts => {

  const topic_id: number = posts?.[0]?.topic_id

  const post_ids: number[] = posts.map(post => post.id)

  console.log('posts', posts)
  const {
    data: postData,
    error,
    isLoading,
  } = useSWR(post_ids.length ? `/api/discourse/${topic_id}/posts/${post_ids.join(',')}` : null, fetcher)

  if (error) console.log(error)

  return { posts: postData, isLoading }
}

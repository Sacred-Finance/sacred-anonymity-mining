import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Post, Topic } from '@components/Discourse/types'
import '../topic-post.scss'
import { useAnimation } from 'framer-motion'
import { RecursivePostRenderer } from '@components/Discourse/TopicPosts/RecursivePostRenderer'
import { nestPosts } from '@components/Discourse/TopicPosts/helper'

const TopicPosts = ({ topic, mutate }: { topic: Topic; mutate: (newPost: Post) => void }) => {
  const postRefs = useRef<{ [key: number]: React.RefObject<HTMLDivElement> }>({})
  const [targetPostNumber, setTargetPostNumber] = useState<number | null>(null)
  const [postsInView, setPostsInView] = useState([])

  const filteredPosts = topic.post_stream.posts.filter(post => !post?.hidden && !post?.deleted_at)

  useEffect(() => {
    if (targetPostNumber) {
      const postRef = postRefs.current[targetPostNumber]
      if (postRef && postRef.current) {
        postRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTargetPostNumber(null) // Clear the target post number
      }
    }
  }, [targetPostNumber, topic])

  const controls = useAnimation()

  // create a multi-level nested object of posts by zip
  const nestedPosts = useMemo(() => nestPosts(filteredPosts), [filteredPosts])

  if (!topic || !filteredPosts) {
    return <div>Loading...</div>
  }

  return (
    <div className={'flex flex-col bg-red-500'}>
      {nestedPosts.map(post => (
          <RecursivePostRenderer
            key={post.id}
            post={post}
            postRefs={postRefs}
            setPostsInView={setPostsInView}
            controls={controls}
            setTargetPostNumber={setTargetPostNumber}
            addReplyToPosts={mutate}
            depth={0}
          />
      ))}
    </div>
  )
}

export default TopicPosts

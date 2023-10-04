import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { StatsBadge } from '@components/Discourse/TopicPosts/StatsBadge'
import { ArrowDownIcon, ArrowUpIcon, ClockIcon, FingerPrintIcon } from '@heroicons/react/20/solid'
import { PostContent } from '@components/Discourse/TopicPosts/PostContent'
import { PostFooter } from '@components/Discourse/TopicPosts/PostFooter'
import { formatDistanceToNow } from 'date-fns'
import _ from 'lodash'
import { PostAuthorInformation } from '@components/Discourse/TopicPosts/PostAuthorInformation'

export const RenderPost = ({ post, postRefs, setPostsInView, controls, setTargetPostNumber, addReplyToPosts }) => {
  const postRef = postRefs.current[post.post_number] || (postRefs.current[post.post_number] = useRef<HTMLDivElement>())

  const handleViewportEnter = () => {
    setPostsInView(prev => [...prev, post.post_number])
  }

  const handleViewportLeave = () => {
    setPostsInView(prev => prev.filter(num => num !== post.post_number))
  }

  return (
    <motion.div
      id={`post-${post.post_number}`}
      ref={postRef}
      animate={controls}
      initial={{ backgroundColor: '' }}
      onViewportEnter={handleViewportEnter}
      onViewportLeave={handleViewportLeave}
      viewport={{ amount: 0.5 }}
      className="flex flex-col gap-4 border border-gray-100/80 bg-gray-100/90 p-4 transition-colors duration-1000"
    >
      <div className={'flex w-full items-center justify-start  border-b-2 pb-1'}>
        <StatsBadge icon={<PostAuthorInformation post={post} />} />
        <StatsBadge value={post.post_number} icon={<FingerPrintIcon width={20} />} />
        <StatsBadge
          label="#"
          value={_.capitalize(formatDistanceToNow(new Date(post.created_at), { addSuffix: true }))}
          icon={<ClockIcon className={'w-6 fill-gray-700 stroke-none p-0'} />}
        />
      </div>

      <PostContent post={post} />
      <PostFooter post={post} addReplyToPosts={addReplyToPosts} />
    </motion.div>
  )
}

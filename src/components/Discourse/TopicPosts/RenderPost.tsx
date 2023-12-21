import React from 'react'
import { motion } from 'framer-motion'
import { StatsBadge } from '@components/Discourse/TopicPosts/StatsBadge'
import { ClockIcon, FingerPrintIcon } from '@heroicons/react/20/solid'
import { PostContent } from '@components/Discourse/TopicPosts/PostContent'
import { PostFooter } from '@components/Discourse/TopicPosts/PostFooter'
import { formatDistanceToNow } from 'date-fns'
import _ from 'lodash'
import { PostAuthorInformation } from '@components/Discourse/TopicPosts/PostAuthorInformation'
import clsx from 'clsx'

export const RenderPost = ({
  post,
  controls,
  addReplyToPosts,
  depth,
  readonly = false,
}) => {
  return (
    <motion.div
      id={`post-${post.post_number}`}
      animate={controls}
      initial={{ backgroundColor: '' }}
      viewport={{ amount: 0.5 }}
      className={clsx(
        depth === 0 ? 'ml-0' : 'ml-8',
        'flex flex-col gap-8 rounded-lg border border-gray-300 bg-white p-6 shadow-md transition-colors duration-300 hover:bg-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-900/80'
      )}
    >
      <div className="flex w-full items-center justify-start gap-4 border-b-2 border-gray-300 pb-2 dark:border-gray-600">
        <StatsBadge icon={<PostAuthorInformation post={post} />} />
        <StatsBadge
          value={post.post_number}
          icon={
            <FingerPrintIcon
              className="text-blue-500 dark:text-blue-400"
              width={20}
            />
          }
        />
        <StatsBadge
          label="#"
          value={_.capitalize(
            formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
          )}
          icon={
            <ClockIcon className="w-6 p-0 text-gray-600 dark:text-gray-400" />
          }
        />
      </div>

      <PostContent post={post} />
      <PostFooter
        post={post}
        addReplyToPosts={addReplyToPosts}
        readonly={readonly}
      />
    </motion.div>
  )
}

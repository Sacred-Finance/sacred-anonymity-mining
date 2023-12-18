// Topic.tsx
import React from 'react'
import type { Topic } from '@components/Discourse/types'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'

const TimeSinceLastPost: React.FC<{ topic: Topic }> = ({ topic }) => (
  <li className="my-1">
    Last Post: {formatDistanceToNow(new Date(topic.last_posted_at))}
  </li>
)

const TimeSinceTopicCreated: React.FC<{ topic: Topic }> = ({ topic }) => (
  <li className="my-1">
    Created: {formatDistanceToNow(new Date(topic.created_at))}
  </li>
)

const TopicCommunityCard: React.FC<{
  topic: Topic
  variant?: 'banner' | 'default'
}> = ({ topic, variant = 'default' }) => {
  const router = useRouter()
  const { groupId } = router.query

  return (
    <Link
      key={topic.id}
      href={`/discourse/${groupId}/${topic.id}`}
      className={clsx(
        'relative block w-full max-w-lg shrink-0 grow rounded shadow transition-transform dark:shadow-white',
        variant === 'banner'
          ? 'pointer-events-auto '
          : 'hover-peer:-z-[1] peer overflow-hidden border border-gray-900 bg-white transition-all duration-300 ease-in-out hover:z-[150] dark:bg-gray-900 sm:w-full md:w-auto'
      )}
    >
      <div className="relative flex h-full flex-col space-y-4 rounded bg-white transition-colors dark:bg-gray-900">
        <div className="flex h-36 w-full items-center justify-center rounded-t bg-gray-800 p-4 text-xl font-semibold text-white dark:text-gray-300">
          {topic?.fancy_title}
        </div>
        <div className="space-y-2 p-4">
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              Posts: {topic.posts_count}
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              Likes: {topic.like_count}
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              Views: {topic.views}
            </span>
          </div>
          <ul className="text-xs text-gray-500 dark:text-gray-400">
            <TimeSinceTopicCreated topic={topic} />
            <TimeSinceLastPost topic={topic} />
          </ul>
        </div>
      </div>
    </Link>
  )
}

export default TopicCommunityCard

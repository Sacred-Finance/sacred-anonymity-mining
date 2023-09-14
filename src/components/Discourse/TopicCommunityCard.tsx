// Topic.tsx
import React from 'react'
import { Topic } from '@components/Discourse/types'
import { formatDistanceToNow } from '@/lib/utils'
import clsx from 'clsx'
import Link from 'next/link'

const TimeSinceLastPost: React.FC<{ topic: Topic }> = ({ topic }) => (
  <li>Last Post: {formatDistanceToNow(new Date(topic.last_posted_at))}</li>
)
const TimeSinceTopicCreated: React.FC<{ topic: Topic }> = ({ topic }) => (
  <li>Created: {formatDistanceToNow(new Date(topic.created_at))}</li>
)

const TopicCommunityCard: React.FC<{ topic: Topic; variant?: 'banner' | 'default' }> = ({
  topic,
  variant = 'default',
}) => (
  <Link
    key={topic.id}
    href={`/discourse/${topic.id}`}
    className={clsx(
      'relative w-full flex-grow flex-shrink-0 max-w-lg',
        variant === 'banner'
            ? 'pointer-events-auto '
            : 'hover-peer:-z-[1] peer overflow-hidden rounded border border-gray-900 bg-white transition-all duration-300 ease-in-out hover:z-[150] sm:w-full md:w-auto'
    )}
  >
    <div className={'space-y-8 relative flex h-full flex-col rounded bg-white'}>
      <div className="relative grid grid-cols-8 items-center justify-items-center">
        <div className="col-span-full p-4 flex h-36 w-full items-center justify-center rounded-t bg-primary-400 text-xl font-semibold text-white">
          {topic?.fancy_title}
        </div>
      </div>
      <div className="p-2">
        <span className="">Posts: {topic.posts_count}</span>
        <span className="">Likes: {topic.like_count}</span>
        <span>Views: {topic.views}</span>
        <ul className=" text-xs">
          <TimeSinceTopicCreated topic={topic} />
          <TimeSinceLastPost topic={topic} />
        </ul>
      </div>
    </div>
  </Link>
)

export default TopicCommunityCard

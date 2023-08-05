// Topic.tsx
import React from 'react'
import { Topic } from '@components/Discourse/types'
import { formatDistanceToNow } from '@/lib/utils'
import clsx from 'clsx'
import EditGroupModal from '@components/EditGroupModal'
import Link from 'next/link'
import { CommunityCardHeader } from '@components/CommunityCard/CommunityCardHeader'
import { CommunityCardBody } from '@components/CommunityCard/CommunityCardBody'
import { CommunityCardFooter } from '@components/CommunityCard/CommunityCardFooter'
import { CommunityContext } from '@components/CommunityCard/CommunityCard'

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
      'relative w-full',
      variant === 'banner' ? 'pointer-events-auto ' : 'max-w-[450px] rounded-lg ring-1 ring-gray-900'
    )}
  >
    <div className={'relative flex h-full flex-col rounded-lg'}>
      <div className="relative grid grid-cols-8 items-center justify-items-center">
        <div className="col-span-full flex h-36 w-full items-center justify-center rounded-t-lg bg-primary-500 text-xl font-semibold text-white">
          {topic?.fancy_title}
        </div>
      </div>
      <div className="mt-2 p-2">
        <span className="mr-2">Posts: {topic.posts_count}</span>
        <span className="mr-2">Likes: {topic.like_count}</span>
        <span>Views: {topic.views}</span>
        <ul className="mt-2 text-xs">
          <TimeSinceTopicCreated topic={topic} />
          <TimeSinceLastPost topic={topic} />
        </ul>
      </div>
    </div>
  </Link>
)

export default TopicCommunityCard

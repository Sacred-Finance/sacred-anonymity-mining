// Topic.tsx
import React from 'react'
import { Topic } from '@components/Discourse/types'
import { formatDistanceToNow } from '@/lib/utils'

const TopicComponent: React.FC<{ topic: Topic }> = ({ topic }) => (
  <div className="border-b">
    <div className="mb-1 bg-primary-500 text-lg font-bold text-white px-3">{topic.title}</div>
    <div className="text-sm text-gray-500">{topic.fancy_title}</div>
    <div className="mt-2">
      <span className="mr-2">Posts: {topic.posts_count}</span>
      <span className="mr-2">Likes: {topic.like_count}</span>
      <span>Views: {topic.views}</span>
      <ul className="mt-2 text-xs">
        <li className="mr-2">Created: {formatDistanceToNow(new Date(topic.created_at))}</li>
        <li>Last Post: {formatDistanceToNow(new Date(topic.last_posted_at))}</li>
      </ul>
    </div>
  </div>
)

export default TopicComponent

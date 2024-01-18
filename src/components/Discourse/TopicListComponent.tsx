// TopicList.tsx
import React from 'react'
import type { TopicList } from '@components/Discourse/types'
import TopicCommunityCard from '@components/Discourse/TopicCommunityCard'

const TopicListComponent: React.FC<{ topicList: TopicList }> = ({ topicList }) => (
  <div>
    {topicList.topics.map(topic => (
      <TopicCommunityCard key={topic.id} topic={topic} />
    ))}
  </div>
)

export default TopicListComponent

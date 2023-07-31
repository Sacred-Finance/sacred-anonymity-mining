// TopicList.tsx
import React from 'react'
import { TopicList } from '@components/Discourse/types'
import TopicComponent from '@components/Discourse/TopicComponent'

const TopicListComponent: React.FC<{ topicList: TopicList }> = ({ topicList }) => (
  <div>
    {topicList.topics.map(topic => (
      <TopicComponent key={topic.id} topic={topic} />
    ))}
  </div>
)

export default TopicListComponent

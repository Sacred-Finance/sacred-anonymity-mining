import axios from 'axios'
import { useState, useEffect } from 'react'
import TopicCommunityCard from '@components/Discourse/TopicCommunityCard'
import { TopicList } from '@components/Discourse/types'

const AllTopics = () => {
  const [topicList, setTopicList] = useState<TopicList>()

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get('/api/discourse/allTopics')
        setTopicList(response.data.topic_list)
      } catch (error) {
        console.error(error)
      }
    }

    fetchTopics()
  }, [])

  return (
    <>
      {topicList?.topics?.map(topic => (
        <TopicCommunityCard key={topic.id} topic={topic} variant={'default'} />
      ))}
    </>
  )
}

export default AllTopics

import axios from 'axios'
import { useState, useEffect } from 'react'
import TopicComponent from '@components/Discourse/TopicComponent'
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
      <div className="row-gap-8 mb-8 grid grid-cols-1 justify-items-center   gap-4 sm:grid-cols-1 md:grid-cols-2 md:justify-items-center lg:grid-cols-3">
        {topicList?.topics?.map(topic => (
          <TopicComponent key={topic.id} topic={topic} variant={'default'} />
        ))}
      </div>
    </>
  )
}

export default AllTopics

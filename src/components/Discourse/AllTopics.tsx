import axios from 'axios'
import { useState, useEffect } from 'react'
import Link from 'next/link'
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
      <h1>Discourse</h1>

      <div className="row-gap-8 mb-8 grid grid-cols-1 justify-items-center   gap-4 sm:grid-cols-1 md:grid-cols-2 md:justify-items-center lg:grid-cols-3">
        {topicList?.topics?.map(topic => (
          <Link
            key={topic.id}
            href={`/discourse/${topic.id}`}
            className="m-4 flex w-64 flex-col rounded-lg bg-white shadow-md transition-shadow duration-200 ease-in-out hover:shadow-lg"
          >
            <TopicComponent topic={topic} />
          </Link>
        ))}
      </div>
    </>
  )
}

export default AllTopics

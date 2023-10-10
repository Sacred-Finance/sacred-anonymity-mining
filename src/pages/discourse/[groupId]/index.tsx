import React, { useEffect, useState } from 'react'
import WithStandardLayout from '@components/HOC/WithStandardLayout'
import TopicCommunityCard from '@/components/Discourse/TopicCommunityCard'
import { TopicList } from '@/components/Discourse/types'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useFetchMetadata } from '@/hooks/discourse/useFetchMetadata'
import { CircularLoader } from '@/components/JoinCommunityButton'

export const DiscourseCommunityBanner = (loading, community) => (
  (<div className="m-8 w-auto rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
    {loading ? (
      <CircularLoader className="mx-auto my-5 h-8 w-8" />
    ) : (
      <>
        <img className="m-auto h-[10%] w-[10%] rounded-t-lg pt-2" src={community?.image} alt="" />
        <div className="p-3 text-center">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{community?.name}</h5>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{community?.description}</p>
        </div>
      </>
    )}
  </div>
))

const Index = () => {
  const router = useRouter()
  const { groupId } = router.query
  const { community, loading } = useFetchMetadata(groupId)
  const [topicList, setTopicList] = useState<TopicList>()

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get(`/api/discourse/${groupId}/topics`, {})
        setTopicList(response.data.topic_list)
      } catch (error) {
        console.error(error)
      }
    }

    fetchTopics()
  }, [])

  return (
    <>
      {DiscourseCommunityBanner(loading, community)}
      <div className="row-gap-8 m-8 grid grid-cols-1 justify-items-center   gap-4 sm:grid-cols-1 md:grid-cols-2 md:justify-items-center lg:grid-cols-3">
        {topicList?.topics?.map(topic => (
          <TopicCommunityCard key={topic.id} topic={topic} variant={'default'} />
        ))}
      </div>
    </>
  )
}

export default WithStandardLayout(Index)

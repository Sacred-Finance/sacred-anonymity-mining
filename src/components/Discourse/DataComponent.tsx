import React from 'react'
import type { Data } from '@components/Discourse/types'
import UserComponent from '@components/Discourse/UserComponent'
import TopicListComponent from '@components/Discourse/TopicListComponent'

const DataComponent: React.FC<{ data: Data }> = ({ data }) => (
  <div className="p-4">
    <div className="">
      <h1 className="text-2xl font-bold ">Users</h1>
      {data.users.map(user => (
        <UserComponent key={user.id} user={user} />
      ))}
    </div>
    <div>
      <h1 className="text-2xl font-bold ">Topics</h1>
      <TopicListComponent topicList={data.topic_list} />
    </div>
  </div>
)

export default DataComponent

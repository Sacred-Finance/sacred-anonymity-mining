import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Topic } from '@components/Discourse/types'
import parse, { attributesToProps, domToReact } from 'html-react-parser'
import './topic-post.scss'
import { timeSince } from '@metamask/utils'
import { formatDistanceToNow } from '@/lib/utils'
import _ from 'lodash'

const TopicPosts = ({ topic }: { topic: Topic }) => {
  console.log(topic)

  if (!topic) {
    return <div>Loading...</div>
  }

  //https://sea1.discourse-cdn.com/basic10/user_avatar/logos.discourse.group/laughingwhales/96/5_2.png
  //https://sea1.discourse-cdn.com/basic10/user_avatar/logos.discourse.group/laughingwhales/{size}/5_2.png
  return (
    <div className="topic-post  flex flex-col">
      {topic.post_stream.posts.map((post, index) => {
        return (
          <div className="my-4 flex min-h-[200px] flex-col border-b-8  pb-8 first:border-t-4" key={index}>
            <div className="flex space-x-4">
              {post.avatar_template && (
                <img
                  className="rounded-full"
                  src={`https://sea1.discourse-cdn.com/basic10${post.avatar_template.replace('{size}', '96')}`}
                  alt={post.username}
                />
              )}

              <div className="flex-1">
                <div className=" text-gray-500">{_.startCase(post.username)}</div>
                <div className="text-gray-500">
                  {_.startCase(formatDistanceToNow(new Date(post.updated_at).getTime()))}
                </div>
              </div>
              <hr />
            </div>
            {parse(post.cooked)}
          </div>
        )
      })}
    </div>
  )
}

export default TopicPosts

import { Avatar } from '@components/Discourse/TopicPosts/Avatar'
import _ from 'lodash'
import React from 'react'
import {formatDistanceToNow} from "date-fns";

export const PostAuthorInformation = ({ post }) => (
  <div className=" flex items-center space-x-4">
    <Avatar post={post} size={80} />
    <div className="flex-1">
      <div className="text-lg font-semibold text-gray-500">{_.startCase(post.username)}</div>
      <div className="text-sm text-gray-500">
        {_.startCase(formatDistanceToNow(new Date(post.created_at).getTime()))}
      </div>
    </div>
  </div>
)

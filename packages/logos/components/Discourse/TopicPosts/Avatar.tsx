import { Topic } from '@components/Discourse/types'
import React from 'react'

export function Avatar({ post, size }: { post: Topic['post_stream']['posts'][0]; size?: number }) {
  return post.avatar_template ? (
    <img
      className="rounded-full"
      src={`https://sea1.discourse-cdn.com/basic10${post.avatar_template.replace(
        '{size}',
        size ? size.toString() : '90'
      )}`}
      alt={post.username}
    />
  ) : (
    <div className="h-16 w-16 rounded-full bg-gray-500" />
  )
}

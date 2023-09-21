// Helper components
import Link from 'next/link'
import React from 'react'
import clsx from 'clsx'

export const PostTitle = ({ title, id, onPostPage, post }) => {
  if (onPostPage) return <h1 className={clsx('text-xl font-bold text-gray-700')}>{title}</h1>
  return (
      <Link href={`/communities/${post.groupId}/post/${post.id}`}

      className={clsx(
        'flex items-center gap-4 text-xl font-bold text-gray-700 hover:underline group-hover/post-item:text-blue-500'
      )}
      onClick={e => {
        if (onPostPage) {
          e.preventDefault()
        }
      }}
    >
      {id} {post.title}
    </Link>
  )
}

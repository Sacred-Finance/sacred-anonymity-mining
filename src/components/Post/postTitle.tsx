// Helper components
import Link from 'next/link'
import React from 'react'
import clsx from 'clsx'

export const PostTitle = ({ title, id, onPostPage, router }) => {
  if (onPostPage) return <h1 className={clsx('text-xl font-bold text-gray-700 ')}>{title}</h1>
  return (
    <Link
      className={clsx('text-xl font-bold text-gray-700 hover:underline group-hover/post-item:text-blue-500')}
      href={`${router.asPath}/post/${id}`}
      onClick={e => {
        if (onPostPage) {
          e.preventDefault()
        }
      }}
    >
      {title} - {id}
    </Link>
  )
}

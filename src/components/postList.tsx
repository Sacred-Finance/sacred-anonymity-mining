import { VoteDownButton, VoteUpButton } from './buttons'
import React from 'react'
import SortBy from './SortBy'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { BigNumber } from 'ethers'
import { p } from '@noble/curves/pasta'

export const PostList = ({ posts, isLoading,  voteForPost, handleSortChange }) => {
  return (
    <div className="mt-6 flex flex-col space-y-4 ">
      <SortBy onSortChange={handleSortChange} targetType="posts" />
      {posts.map((p, i) => (
        <PostItem post={p} key={p.id} voteForPost={voteForPost} isLoading={isLoading} />
      ))}
    </div>
  )
}

const classes = {
  postItem: 'flex items-start space-x-4 rounded-lg border-2 border-gray-200 p-4',
  postItemPostPage: 'cursor-auto flex items-start space-x-4 rounded-lg border-2 border-gray-200 p-4',
}
const PostItem = ({ isLoading, voteForPost, post }) => {
  const router = useRouter()
  const { postId } = router.query

  const { id, title, upvote, downvote, createdAt, views, comments } = post

  const onPostPage = !isNaN(postId)
  const classy = { [classes.postItem]: true, [classes.postItemPostPage]: onPostPage }

  if (!post || !router.isReady) return null
  return (
    <Link
      href={router.asPath + `/post/${id}`}
      onClick={e => {
        // if we are on the post page, don't navigate
        if (onPostPage) {
          e.preventDefault()
          return false
        }
      }}
      className={clsx(classy)}
    >
      <div className="flex w-full flex-col space-y-2">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold">
            {title} - {id}
          </h2>
          <div className="flex items-center space-x-4">
            <VoteUpButton
              onClick={async e => {
                console.log('upvote')
                e.stopPropagation()
                e.preventDefault()
                if (isNaN(id)) {
                  throw new Error('postId is undefined, upvote')
                  return false
                }

                await voteForPost(BigNumber.from(id).toNumber(), 0)
              }}
              disabled={isLoading}
            />
            <span className="text-gray-500">{upvote}</span>
            <VoteDownButton
              onClick={async e => {
                console.log('downvote')
                e.stopPropagation()
                e.preventDefault()
                if (isNaN(id)) {
                  throw new Error('postId is undefined, downvote')
                  return false
                }
                await voteForPost(BigNumber.from(id).toNumber(), 1)
              }}
              disabled={isLoading}
            />
            <span className="text-gray-500">{downvote}</span>
          </div>
        </div>
        {createdAt && (
          <p className="text-gray-500">
            🕛{' '}
            {formatDistanceToNow(new Date(createdAt), {
              addSuffix: true,
            })}
          </p>
        )}
        <div className="flex items-center space-x-4">
          {views && <span className="text-gray-500">{views.length} views</span>}
          {comments && <span className="text-gray-500">{comments.length} comments</span>}
        </div>
      </div>
    </Link>
  )
}

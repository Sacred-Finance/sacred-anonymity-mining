import { VoteDownButton, VoteUpButton } from './buttons'
import { formatDistanceToNow } from '../lib/utils'
import React from 'react'
import SortBy from './SortBy'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'

export const PostList = ({ posts, isLoading, data, voteForPost, handleSortChange }) => {
    console.log(posts)
    return (
        <div className="mt-6 flex flex-col space-y-4 ">
            <SortBy onSortChange={handleSortChange} targetType="posts"/>
            {posts.map((p, i) => (
                <PostItem post={p} index={i} key={p.id} voteForPost={voteForPost} isLoading={isLoading} data={data}/>
            ))}
        </div>
    )
}

const classes = {
  postItem: 'flex items-start space-x-4 rounded-lg border-2 border-gray-200 p-4',
  postItemPostPage: 'cursor-auto flex items-start space-x-4 rounded-lg border-2 border-gray-200 p-4',
}
const PostItem = ({ isLoading, voteForPost, data, post, index }) => {
  const router = useRouter()

  const { postId } = router.query

    console.log('post.id', post.id)
  const classy = { [classes.postItem]: true, [classes.postItemPostPage]: !isNaN(postId) }

  if (!post) return null

  const { id, title, upvote, downvote, createdAt, views, comments } = post

  const handlePostClick = () => {
    if (!isNaN(postId)) return
    router.push(router.asPath + `/post/${id}`)
  }
  return (
    <button onClick={handlePostClick} className={clsx(classy)}>
      <div className="flex w-full flex-col space-y-2">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="flex items-center space-x-4">
            <VoteUpButton
              onClick={e => {
                console.log('upvote')
                e.stopPropagation()
                e.preventDefault()
                if (isNaN(id)) {
                  throw new Error('postId is undefined')
                  return
                }

                voteForPost(postId, 0)
              }}
              disabled={isLoading}
            />
            <span className="text-gray-500">{upvote}</span>
            <VoteDownButton
              onClick={e => {
                console.log('downvote')
                e.stopPropagation()
                e.preventDefault()
                voteForPost(postId, 1)
              }}
              disabled={isLoading}
            />
            <span className="text-gray-500">{downvote}</span>
          </div>
        </div>
        {createdAt && <p className="text-gray-500">{formatDistanceToNow(new Date(createdAt))}</p>}
        <div className="flex items-center space-x-4">
          {views && <span className="text-gray-500">{views.length} views</span>}
          {comments && <span className="text-gray-500">{comments.length} comments</span>}
        </div>
      </div>
    </button>
  )
}

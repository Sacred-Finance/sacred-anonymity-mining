import { VoteDownButton, VoteUpButton } from './buttons'
import { formatDistanceToNow } from '../lib/utils'
import React from 'react'
import SortBy from './SortBy'
import Link from "next/link";
import {useRouter} from "next/router";

export const PostList = ({ posts, isLoading, data, voteForPost, handleSortChange }) => (
  <div className="mt-6 flex flex-col space-y-4 ">
    <SortBy onSortChange={handleSortChange} targetType="posts" />
    {posts.map((p, i) => (
      <PostItem post={p} index={i} key={i} voteForPost={voteForPost} isLoading={isLoading} data={data} />
    ))}
  </div>
)
const PostItem = ({
  isLoading,
  voteForPost,
  data,
  post: { comments, createdAt, downvote, id, likes, title, upvote, views },
  index,
}) => {
  const router = useRouter()
  // userouter to push appending /posts/id to the current path

  const handlePostClick = () => {
    router.push(router.asPath + `/post/${id}`)
  }
  return (
    <button onClick={handlePostClick} className="flex items-start space-x-4 rounded-lg border-2 border-gray-200 p-4">
      <div className="flex w-full flex-col space-y-2">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="flex items-center space-x-4">
            <VoteUpButton onClick={() => voteForPost(id, 1)} disabled={isLoading} />
            <span className="text-gray-500">{upvote}</span>
            <VoteDownButton onClick={() => voteForPost(id, 0)} disabled={isLoading} />
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

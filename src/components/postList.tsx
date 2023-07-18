import { VoteDownButton, VoteUpButton } from './buttons'
import React from 'react'
import SortBy from './SortBy'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { BigNumber } from 'ethers'
import { p } from '@noble/curves/pasta'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'

export const PostList = ({
  posts,
  voteForPost,
  handleSortChange,
  showFilter,
  showDescription = false,
  editor = undefined,
}) => {
  return (
    <div className="mt-6 flex flex-col space-y-4 ">
      {showFilter && <SortBy onSortChange={handleSortChange} targetType="posts" />}
      {posts.map((p, i) => (
        <>
          <PostItem post={p} key={p.id} voteForPost={voteForPost} showDescription={showDescription} editor={editor} />
        </>
      ))}
    </div>
  )
}

const classes = {
  postItem: 'flex items-start space-x-4 rounded-lg border-2 border-gray-200 p-4',
  postItemPostPage: 'cursor-auto flex items-start space-x-4 rounded-lg border-2 border-gray-200 p-4',
}
const PostItem = ({ voteForPost, post, showDescription = false, isPostEditable = false, editor = undefined }) => {
  const router = useRouter()
  const { postId } = router.query

  const { id, title, upvote, downvote, createdAt, views, comments } = post

  const onPostPage = !isNaN(postId)
  const classy = { [classes.postItem]: true, [classes.postItemPostPage]: onPostPage }

  const [isLoading, setIsLoading] = React.useState(false)
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
            {post?.description && showDescription && <EditorJsRenderer data={post.description} />}
          </h2>
          <div className="flex items-center space-x-4">
            <VoteUpButton
              isLoading={isLoading}
              onClick={async e => {
                e.stopPropagation()
                e.preventDefault()
                if (isNaN(id)) {
                  throw new Error('postId is undefined, upvote')
                  return false
                }
                setIsLoading(true)
                await voteForPost(BigNumber.from(id).toNumber(), 0)
                setIsLoading(false)
              }}
              disabled={isLoading}
            />
            <span className="text-gray-500">{upvote}</span>
            <VoteDownButton
              isLoading={isLoading}
              onClick={async e => {
                e.stopPropagation()
                e.preventDefault()
                if (isNaN(id)) {
                  throw new Error('postId is undefined, downvote')
                  return false
                }
                setIsLoading(true)
                await voteForPost(BigNumber.from(id).toNumber(), 1)
                setIsLoading(false)
              }}
              disabled={isLoading}
            />
            <span className="text-gray-500">{downvote}</span>
          </div>
        </div>

        <div className={'grid grid-cols-6 relative items-center'}>
          {createdAt && (
            <p className="text-gray-500">
              🕛{' '}
              {formatDistanceToNow(new Date(createdAt), {
                addSuffix: true,
              })}
            </p>
          )}
          <div className={'col-span-5 rounded p-2 place-self-end justify-items-stretch'}>{editor}</div>
        </div>
        <div className="flex items-center space-x-4">
          {/*  todo: not showing up */}
          {views && <span className="text-gray-500">{views.length} views</span>}
          {comments && <span className="text-gray-500">{comments.length} comments</span>}
        </div>
      </div>
    </Link>
  )
}

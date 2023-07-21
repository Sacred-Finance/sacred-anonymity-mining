import { PrimaryButton, VoteDownButton, VoteUpButton } from './buttons'
import React from 'react'
import SortBy from './SortBy'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { BigNumber } from 'ethers'
import { p } from '@noble/curves/pasta'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import { useAccount } from 'wagmi'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import _ from 'lodash'
import { usePostListContext } from '@/contexts/PostListProvider'
import { useTranslation } from 'react-i18next'

export const PostList = ({ posts, voteForPost, handleSortChange, editor = undefined }) => {
  const { showFilter } = usePostListContext()

  const { address } = useAccount()
  return (
    <div className="mt-6 flex flex-col space-y-4 ">
      {showFilter && <SortBy onSortChange={handleSortChange} targetType="posts" />}
      {posts.map((p, i) => (
        <>
          <PostItem post={p} key={p.id} voteForPost={voteForPost} editor={editor} address={address} />
        </>
      ))}
    </div>
  )
}

const classes = {
  postItem: 'flex items-start space-x-4 rounded-lg border-2 border-gray-200',
  postItemPostPage: 'cursor-auto flex items-start space-x-4 rounded-lg border-2 border-gray-200 p-4',
}
const PostItem = ({ voteForPost, post, editor = undefined, address }) => {
  const { showFilter, isFormOpen, showDescription, setIsFormOpen, isPostEditing, setIsPostEditing, isPostEditable } =
    usePostListContext()
  const router = useRouter()
  const { postId, groupId } = router.query

  const { t } = useTranslation()

  const { id, title, upvote, downvote, createdAt, views, comments } = post

  const onPostPage = !isNaN(postId)
  const classy = { [classes.postItem]: true, [classes.postItemPostPage]: onPostPage }

  const [isLoading, setIsLoading] = React.useState(false)
  const isJoined = useUserIfJoined(groupId as string)


  const handleVote = async (e, vote: 'upvote' | 'downvote') => {
    e.stopPropagation()
    e.preventDefault()
    if (isNaN(id)) {
      throw new Error('postId is undefined, upvote')
      return false
    }
    setIsLoading(true)
    const val = vote === 'upvote' ? 0 : 1
    await voteForPost(BigNumber.from(id).toNumber(), val)
    setIsLoading(false)
  }
  return (
    <div className="relative mx-auto flex w-full items-stretch justify-between overflow-hidden rounded border  bg-gray-100 ">
      <div className="w-full bg-gray-50">
        <div className="border-r px-4 py-2">
          <div>
            <Link
              hidden={isFormOpen}
              className="text-2xl font-semibold text-gray-800 hover:text-blue-500"
              href={router.asPath + `/post/${id}`}
              onClick={e => {
                if (onPostPage) {
                  e.preventDefault()
                  return false
                }
              }}
            >
              {_.startCase(title)} - {id}
            </Link>
            <div className="text-sm text-gray-400">
              {createdAt && formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
        <div className="border-t bg-gray-100 px-4 py-2 text-black">
          {views && <span className="text-gray-600">{views.length} views</span>}
          {comments && <span className="text-gray-600">{comments.length} comments</span>}
          <div className={'text-gray-900'}>{editor && isPostEditable && editor}</div>
          {showDescription && !isFormOpen && <EditorJsRenderer data={post.description} onlyPreview={isNaN(postId)} />}
          {!isFormOpen && isPostEditable && editor && (
            <PrimaryButton onClick={() => setIsFormOpen(true)}>{t('button.editPost')}</PrimaryButton>
          )}
        </div>
      </div>

      <div className={'sticky top-0 flex flex-col items-center justify-around self-start'}>
        <div className={'flex items-center gap-1 pe-2'}>
          <VoteUpButton
            isConnected={!!address}
            isJoined={!!isJoined}
            isLoading={isLoading}
            onClick={e => handleVote(e, 'upvote')}
            disabled={isLoading || !address}
          />
          <span className=" font-bold text-gray-700">{upvote}</span>
        </div>
        <div className={'mb-1 flex items-center gap-1 pe-2'}>
          <VoteDownButton
            isConnected={!!address}
            isJoined={!!isJoined}
            isLoading={isLoading}
            onClick={e => handleVote(e, 'downvote')}
            disabled={isLoading || !address}
          />
          <span className="font-bold text-gray-700">{downvote}</span>
        </div>
      </div>
    </div>
  )
}

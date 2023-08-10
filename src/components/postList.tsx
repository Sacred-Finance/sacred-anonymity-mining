import { PrimaryButton, VoteDownButton, VoteUpButton } from './buttons'
import React from 'react'
import SortBy from './SortBy'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { formatDistanceToNow } from 'date-fns'
import { BigNumber } from 'ethers'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import { useAccount } from 'wagmi'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { Item } from '@/types/contract/ForumInterface'
import PollItem from './PollItem'

export const PostList = ({ posts, voteForPost, handleSortChange, editor = undefined, showFilter }) => {
  const { address } = useAccount()
  return (
    <div className="mt-6 flex flex-col space-y-4 ">
      {showFilter && <SortBy onSortChange={handleSortChange} targetType="posts" />}
      {posts.map((p, i) => (
        <React.Fragment key={p.id}>
          {
            p?.kind == 0 || p?.kind == 1 && <PostItem
              post={p}
              key={p.id}
              voteForPost={voteForPost}
              editor={editor}
              address={address}
              showDescription={true}
            />
          }
          {
            p?.kind == 2 && <PollItem
              key={p.id}
              voteForPost={voteForPost}
              address={address}
              post={p}
            />
          }
        </React.Fragment>
      ))}
    </div>
  )
}

const classes = {
  postItem: 'flex items-start space-x-4 rounded-lg border-2 border-gray-200',
  postItemPostPage: 'cursor-auto flex items-start space-x-4 rounded-lg border-2 border-gray-200 p-4',
}

interface PostItem {
  voteForPost: (postId: number, vote: number) => Promise<void>
  post: Item
  editor?: any
  address: string
  isPostEditable?: boolean

  showDescription?: boolean
  isFormOpen?: boolean
  setIsFormOpen?: (value: boolean) => void
}

export const PostItem = ({
  voteForPost,
  post,
  address,
  isPostEditable,
  showDescription,
  isFormOpen,
  setIsFormOpen,
  editor = undefined,
}: PostItem) => {
  const router = useRouter()
  const { postId, groupId } = router.query

  const { t } = useTranslation()

  const { id, title, upvote, downvote, createdAt } = post

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
    const voteResponse = await voteForPost(BigNumber.from(id).toNumber(), val)
    if (voteResponse) {
      console.log('voteResponse', voteResponse)

    }
    setIsLoading(false)
  }

  const isPreview = isNaN(postId)
  return (
    <div className="relative mx-auto flex w-full items-stretch justify-between overflow-hidden rounded border  bg-gray-100 ">
      <div className="w-full bg-gray-50">
        <div className="border-r px-4 py-2">
          <div>
            <Link
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
          {showDescription && !isFormOpen && postId && (
            <EditorJsRenderer data={post.description} onlyPreview={isPreview} />
          )}
          <br />
          {isPreview
            ? (post?.childIds?.length && <span className="text-gray-600">{post?.childIds?.length} comments</span>) || (
                <span className="text-gray-600">0 comments</span>
              )
            : ''}

          <div className={'text-gray-900 text-sm'}>{editor && isPostEditable && editor}</div>

        </div>
      </div>

      <div className={'sticky top-0 mx-5  flex items-center justify-around self-start'}>
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

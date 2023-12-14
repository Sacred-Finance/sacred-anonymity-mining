import React from 'react'
import { commentIsConfirmed } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { Group, Item } from '@/types/contract/ForumInterface'
import { PostItem } from '@components/Post/PostItem'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { VoteForItemUI } from './PostPage'
import AnimalAvatar from '../AnimalAvatar'

export interface TempComment {
  id: string
  createdAt: Date
  content: string
}

export const NewPostModal: {
  openFormButtonClosed: string
  editor: string
  submitButton: string
  formBody: string
  rootOpen: string
  formContainerOpen: string
  rootClosed: string
  openFormButtonOpen: string
} = {
  rootClosed: '!w-fit !p-0',
  rootOpen:
    'fixed z-50 inset-0 p-12 bg-gray-900/50 flex justify-center items-center ',
  formBody: 'w-full h-full flex flex-col gap-4 min-h-[400px] justify-between ',
  editor:
    'border rounded-md py-2 px-3 min-h-[300px] transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 dark:text-dark-100 ',
  submitButton:
    'bg-green-500 text-white border-none rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 ',
  formContainerOpen:
    'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg w-full max-w-3xl ',
  openFormButtonOpen: 'self-end hidden',
  openFormButtonClosed:
    'h-full bg-primary text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600',
}

export const PostComment = ({ comment }: { comment: Item }) => {
  const { state } = useCommunityContext()
  const community = state?.activeCommunity?.community as Group
  return (
    <>
      {comment && (
        <PostItem post={comment} group={community} showAvatar={false} />
      )}
      <div className="pt-3 text-gray-600 dark:text-gray-400">
        <div
          className="flex items-center gap-4"
          style={{
            visibility: commentIsConfirmed(comment.id) ? 'visible' : 'hidden',
          }}
        >
          {
            <AnimalAvatar
              seed={`${comment.note}_${Number(comment.groupId)}`}
              options={{ size: 30 }}
            />
          }

          <VoteForItemUI
            postId={comment.parentId}
            post={comment}
            group={community}
          />

          <p className="inline-block text-sm">
            🕛{' '}
            {comment?.description?.time || comment?.time
              ? formatDistanceToNow(
                  new Date(
                    comment?.description?.time || comment?.time
                  ).getTime()
                )
              : '-'}
          </p>
        </div>
      </div>
    </>
  )
}

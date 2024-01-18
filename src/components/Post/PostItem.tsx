import { useCommunityContext } from '@/contexts/CommunityProvider'
import { useUserIfJoined } from '@/contexts/UseUserIfJoined'
import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { Identity } from '@semaphore-protocol/identity'
import { createNote } from '@/lib/utils'
import { BigNumber } from 'ethers'
import { PollUI } from '@components/PollIUI'
import { CancelAction, DeleteAction, EditAction, SaveAction } from '@components/Post/ContentActions'
import { PostTitle } from '@components/Post/PostTitle'
import type { User } from '@/lib/model'
import { ContentType } from '@/lib/model'
import { useContentManagement } from '@/hooks/useContentManagement'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useEditItem } from '@/hooks/useEditItem'
import dynamic from 'next/dynamic'
import type { Group, Item } from '@/types/contract/ForumInterface'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import type { Address } from '@/types/common'
import AnimalAvatar from '@components/AnimalAvatar'
import { formatDistanceToNow } from 'date-fns'
import { DropdownCommunityCard } from '@components/CommunityCard/DropdownCommunityCard'
import clsx from 'clsx'
import { VoteUI } from '../Vote'

const Editor = dynamic(() => import('../editor-js/Editor'), {
  ssr: false,
})

interface PostItemProps {
  post: Item
  group: Group
  refreshData?: () => void
}

export const PostItem = ({ post, group, refreshData }: PostItemProps) => {
  const { groupId, parentId, id } = post
  const postId = parentId && +parentId > 0 ? parentId : id
  const member = useUserIfJoined(post.groupId)
  const address = useAccount().address
  const {
    state: { isAdmin, isModerator },
  } = useCommunityContext()
  const [isLoading, setIsLoading] = useState(false)

  const { t } = useTranslation()

  const isAdminOrModerator = isAdmin || isModerator

  const isTypeOfPost = post.kind == ContentType.POST
  const isTypeOfPoll = post.kind == ContentType.POLL

  const { editItem } = useEditItem({
    item: post,
    isAdminOrModerator,
    setIsLoading,
  })

  const saveEditedPost = async () => {
    try {
      if (isTypeOfPost || isTypeOfPoll) {
        if (!contentTitle) {
          toast.error(t('alert.emptyTitle'))
        }
        if (!contentDescription || !contentDescription.blocks?.length) {
          toast.error(t('alert.emptyContent'))
        }
        if (!contentTitle || !contentDescription || !contentDescription.blocks?.length) {
          return toast.error(t('alert.emptyContent'))
        }
      }

      setIsLoading(true)
      console.log({ title: contentTitle, description: contentDescription })
      await editItem({
        content: { title: contentTitle, description: contentDescription },
        itemId: Number(id),
        itemType: post.kind,
        note: post.note,
      }).then(async value => {
        refreshData && refreshData()
        setIsContentEditing(false)
      })
    } catch (error) {
      console.log(error)
      toast.error(t('alert.editFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const {
    contentDescription,
    setContentDescription,
    isContentEditable,
    setIsContentEditing,
    isContentEditing,
    setIsContentEditable,
    contentTitle,
    setContentTitle,
  } = useContentManagement({
    isPostOrPoll: isTypeOfPost || isTypeOfPoll,
    defaultContentDescription: post.description || { blocks: post.blocks },
    defaultContentTitle: post.title,
  })

  useEffect(() => {
    if (!member || !post || !address) {
      return
    }
    updateIsPostEditable({
      post,
      user: member,
      address,
      setIsPostEditable: setIsContentEditable,
      canDelete: isAdminOrModerator,
    })
  }, [member, post, isAdminOrModerator, groupId, isContentEditing])

  const isPostPage = !isNaN(postId)

  return (
    <div>
      <div
        id={post?.isMutating ? `new_item` : `item_${post.id}`}
        className={clsx(['flex flex-col gap-2', post?.isMutating ? 'animate-pulse' : ''])}
      >
        {(isTypeOfPost || isTypeOfPoll) && (
          <div className="flex flex-col gap-4">
            {isContentEditing && (
              <input
                name="title"
                className="focus:ring-primary-dark rounded bg-gray-100 p-4 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
                placeholder={t('placeholder.enterPostTitle') as string}
                type="text"
                value={contentTitle}
                onChange={e => (setContentTitle ? setContentTitle(e.target.value) : null)}
              />
            )}

            {!isContentEditing && post.title && (
              <PostTitle title={post.title} id={post.id} onPostPage={isPostPage} post={post} />
            )}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {!isContentEditing ? (
            <EditorJsRenderer
              data={
                isTypeOfPost || isTypeOfPoll ? post.description : { blocks: post.blocks || post?.description?.blocks }
              }
            />
          ) : (
            <Editor
              holder={`${post?.id}_${isTypeOfPost ? 'post' : 'comment'}`}
              readOnly={!isContentEditing}
              onChange={val => setContentDescription(val)}
              placeholder={t('placeholder.enterPostContent') as string}
              data={post?.description ? post.description : post}
              divProps={{
                className:
                  'rounded-md bg-gray-100 dark:bg-gray-800 dark:!text-white p-4 focus:outline-none focus:ring-2 focus:ring-primary-dark',
              }}
            />
          )}
        </div>

        {isTypeOfPoll && <PollUI group={group} post={post} />}
        <div className="flex items-center justify-between border-t pt-2">
          <div className="flex items-center justify-between gap-4">
            <AnimalAvatar seed={`${post.note}_${Number(post.groupId)}`} options={{ size: 30 }} />

            <VoteUI post={post} group={group} />

            <p className="inline-block text-sm">
              🕛{' '}
              {post?.description?.time || post?.time
                ? formatDistanceToNow(new Date(post?.description?.time || post?.time).getTime())
                : '-'}
            </p>
          </div>

          <div className="flex items-center  gap-2">
            {isContentEditing && <CancelAction onCancel={() => setIsContentEditing(false)} />}
            {isContentEditable && isContentEditing && (
              <SaveAction onSave={() => saveEditedPost()} isLoading={isLoading} item={post} />
            )}
          </div>
          <DropdownCommunityCard
            actions={[
              isContentEditable && !isContentEditing && (
                <EditAction
                  setIsEditing={value => {
                    setIsContentEditing(value)
                    if (value) {
                      setContentDescription(post.description)
                      setContentTitle && setContentTitle(post.title)
                    }
                  }}
                  isEditing={isContentEditing}
                  isLoading={isLoading}
                />
              ),
              // Assuming the DeleteAction should also be conditionally shown
              isAdminOrModerator && isContentEditable && !isContentEditing && (
                <DeleteAction
                  isAdminOrModerator={isAdminOrModerator}
                  itemId={post.id}
                  itemType={post.kind} // Make sure this matches the expected prop
                  groupId={groupId}
                />
              ),
            ]}
          />
        </div>
      </div>
    </div>
  )
}

const updateIsPostEditable = async ({
  post,
  user,
  address,
  setIsPostEditable,
  canDelete,
}: {
  post: Item
  user: User
  address: Address
  setIsPostEditable: React.Dispatch<React.SetStateAction<boolean>>
  canDelete: boolean
}) => {
  if (user && post) {
    const isEditable = await checkIfPostIsEditable({
      post,
      address,
      canDelete,
    })
    setIsPostEditable(isEditable)
  } else {
    setIsPostEditable(false)
  }
}

// Function to check if the post is editable
const checkIfPostIsEditable = async ({
  post,
  address,
  canDelete,
}: {
  post: Item
  address: Address
  canDelete: boolean
}): Promise<boolean> => {
  const userPosting = new Identity(address)
  const generatedNote = await createNote(userPosting)
  const generatedNoteAsBigNumber = BigNumber.from(generatedNote).toString()
  const noteBigNumber = BigNumber.from(post.note).toString()
  return generatedNoteAsBigNumber === noteBigNumber || canDelete
}

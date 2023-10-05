import { useRouter } from 'next/router'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import React, { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import { Identity } from '@semaphore-protocol/identity'
import { createNote } from '@/lib/utils'
import { BigNumber } from 'ethers'
import { PollUI } from '@components/PollIUI'
import { ContentActions } from '@components/Post/ContentActions'
import { PostTitle } from '@components/Post/PostTitle'
import { ContentType, User } from '@/lib/model'
import { useContentManagement } from '@/hooks/useContentManagement'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useEditItem } from '@/hooks/useEditItem'
import dynamic from 'next/dynamic'
import { Item } from '@/types/contract/ForumInterface'
import { mutate } from 'swr'
import { getGroupWithPostAndCommentData } from '@/lib/fetcher'
import { Avatar } from '@components/Avatar'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'

const Editor = dynamic(() => import('../editor-js/Editor'), {
  ssr: false,
})

export const PostItem = ({ post }: { post: Item }) => {
  const router = useRouter()
  const { postId, groupId } = router.query as { postId: string; groupId: string }
  const user = useUserIfJoined(post.groupId)
  const address = useAccount().address
  const { isAdmin, isModerator } = useCheckIfUserIsAdminOrModerator(address)
  const canDelete = isAdmin || isModerator
  const [isLoading, setIsLoading] = useState(false)

  const { t } = useTranslation()
  const contentRef = useRef<any>(null)

  const isAdminOrModerator = isAdmin || isModerator

  const { editItem } = useEditItem({
    groupId: groupId as unknown as number,
    postId: postId as unknown as number,
    isAdminOrModerator: isAdminOrModerator,
    setIsLoading,
  })

  const saveEditedPost = async () => {
    if (!contentRef || !address || !user) return

    try {
      if (!contentTitle) {
        toast.error(t('alert.emptyTitle'))
      }
      if (!contentDescription || !contentDescription.blocks?.length) {
        toast.error(t('alert.emptyContent'))
      }
      if (!contentTitle || !contentDescription || !contentDescription.blocks?.length)
        return toast.error(t('alert.emptyContent'))
      setIsLoading(true)
      await editItem({
        content: { title: contentTitle, description: contentDescription },
        itemId: postId,
        itemType: post.kind,
        note: post.note,
      }).then(async value => {
        await mutate(getGroupWithPostAndCommentData(groupId, postId))
        setIsContentEditing(false)
      })

      toast.success(t('alert.postEditSuccess'))
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
    isPost: true,
    defaultContentDescription: post.description,
    defaultContentTitle: post.title,
  })

  useEffect(() => {
    if (!user || !post || !address || isNaN(groupId)) return
    updateIsPostEditable({
      post,
      user,
      isAdminOrModerator,
      address,
      setIsPostEditable: setIsContentEditable,
      groupId: groupId as unknown as number,
      canDelete,
    })
  }, [user, post, isAdminOrModerator, address, groupId, canDelete])

  const isPostPage = !isNaN(postId)

  return (
    <div className="min-w-[250px] rounded-lg bg-white p-6 shadow-md transition-colors dark:bg-gray-900">
      <div>
        {post.kind === ContentType.POLL && <PollUI id={post.id} groupId={post.groupId} post={post} />}

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {isContentEditing ? (
              <input
                name="title"
                className="focus:ring-primary-dark rounded bg-gray-100 p-4 text-black placeholder-gray-500 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                placeholder={t('placeholder.enterPostTitle') as string}
                type="text"
                value={contentTitle}
                onChange={e => setContentTitle(e.target.value)}
              />
            ) : (
              <PostTitle post={post} id={<Avatar user={post.ownerEpoch} />} onPostPage={isPostPage} router={router} />
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* Do not show label on postPage */}
            {!isPostPage && (
              <label htmlFor="content" className="text-sm text-gray-600 dark:text-gray-400">
                Content
              </label>
            )}

            {!isContentEditing ? (
              <EditorJsRenderer data={post.description} onlyPreview={!postId} />
            ) : (
              <Editor
                editorRef={contentRef}
                holder={`${post?.id}_post`}
                readOnly={!isContentEditing}
                onChange={val => setContentDescription(val)}
                placeholder={t('placeholder.enterPostContent') as string}
                data={post.description}
                className="rounded-md bg-gray-100 dark:bg-gray-800"
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <ContentActions
              item={post}
              contentId={post.id}
              isContentEditable={isContentEditable}
              isEditing={isContentEditing}
              onContentPage={isPostPage}
              save={() => saveEditedPost()}
              groupId={groupId}
              isAdminOrModerator={isAdminOrModerator}
              setIsContentEditing={setIsContentEditing}
              onClickCancel={() => setIsContentEditing(false)}
              isLoading={isLoading}
              hidden={false}
            />
            <CommentCount post={post} isContentEditing={isContentEditing} />
          </div>
        </div>
      </div>
    </div>
  )
}

const updateIsPostEditable = async ({
  post,
  user,
  isAdminOrModerator,
  address,
  setIsPostEditable,
  groupId,
  canDelete,
}: {
  post: Item
  user: User
  isAdminOrModerator: boolean
  address: string
  setIsPostEditable: React.Dispatch<React.SetStateAction<boolean>>
  groupId: number
  canDelete: boolean
}) => {
  console.log('updateIsPostEditable', {
    post,
    user,
    isAdminOrModerator,
    address,
    setIsPostEditable,
    groupId,
    canDelete,
  })
  if (user && post) {
    const isEditable = await checkIfPostIsEditable({
      note: post.note,
      contentCID: post.contentCID,
      address,
      userName: user.name,
      groupId,
      canDelete,
    })
    setIsPostEditable(isEditable)
  }
}

// Function to check if the post is editable
const checkIfPostIsEditable = async ({
  note,
  address,
  userName,
  groupId,
  canDelete,
}: {
  note: any
  contentCID: any
  address: string
  userName: string
  groupId: number
  canDelete: boolean
}): Promise<boolean> => {
  const userPosting = new Identity(`${address}_${groupId}_${userName}`)
  const generatedNote = await createNote(userPosting)
  const generatedNoteAsBigNumber = BigNumber.from(generatedNote).toString()
  const noteBigNumber = BigNumber.from(note).toString()
  return generatedNoteAsBigNumber === noteBigNumber || canDelete
}

const CommentCount = ({ post, isContentEditing }: { post: Item; isContentEditing: boolean }) => {
  if (!isContentEditing) return null
  return <span className="text-gray-600">{post?.childIds?.length || 0} comments</span>
}

import { useRouter } from 'next/router'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import React, { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import { Identity } from '@semaphore-protocol/identity'
import { createNote } from '@/lib/utils'
import { BigNumber } from 'ethers'
import { PollUI } from '@components/PollIUI'
import { ContentActions } from '@components/Post/contentActions'
import { PostTitle } from '@components/Post/postTitle'
import { ContentType, User } from '@/lib/model'
import { useContentManagement } from '@/hooks/useContentManagement'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useEditItem } from '@/hooks/useEditItem'
import dynamic from 'next/dynamic'
import { Item } from '@/types/contract/ForumInterface'
import clsx from 'clsx'
import { mutate } from 'swr'
import { getGroupWithPostAndCommentData } from '@/lib/fetcher'
const Editor = dynamic(() => import('../editor-js/Editor'), {
  ssr: false,
})
export const PostItem = ({ post }: { post: Item; isAdminOrModerator: boolean }) => {
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
    <div className="group/post-item relative p-3">
      <div>
        {post.kind === ContentType.POLL && <PollUI id={post.id} groupId={post.groupId} post={post} />}

        <div className="flex w-full flex-col gap-8">
          <div className="flex w-full flex-col gap-1 ">
            {isPostPage && (
              <label htmlFor="title" className={'text-sm text-gray-500'}>
                Post Title
              </label>
            )}
            {isContentEditing ? (
              <input
                name="title"
                className={clsx(
                  'rounded p-4  text-black placeholder-white/40 ring-1 ring-white focus:outline-none focus:ring-2 focus:ring-primary-dark'
                )}
                placeholder={t('placeholder.enterPostTitle') as string}
                type="text"
                value={contentTitle}
                onChange={e => setContentTitle(e.target.value)}
              />
            ) : (
              <PostTitle title={post.title} id={post.id} onPostPage={isPostPage} router={router} />
            )}
          </div>
          <div className={clsx('flex w-full flex-col gap-1')}>
            {isPostPage && (
              <label htmlFor="content" className={'text-sm text-gray-500'}>
                Post
              </label>
            )}

            <Editor
              editorRef={contentRef}
              holder={`${post?.id}_post`}
              readOnly={!isContentEditing}
              onChange={val => setContentDescription(val)}
              placeholder={t('placeholder.enterPostContent') as string}
              data={post.description}
            />
          </div>
          <div className={'flex items-center justify-between'}>
            {isPostPage && (
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
              />
            )}
            {!isContentEditing && <CommentCount post={post} isPreview={!isPostPage} />}
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
  contentCID,
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

const CommentCount = ({ post, isPreview }: { post: any; isPreview: boolean }) => (
  <span className="text-gray-600">{post?.childIds?.length || 0} comments</span>
)

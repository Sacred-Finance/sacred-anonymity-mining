import React, { useEffect, useRef, useState } from 'react'
import { OutputData } from '@editorjs/editorjs'
import { useTranslation } from 'next-i18next'
import { SortByOption } from '@components/SortBy'
import { useItemsSortedByVote } from '@/hooks/useItemsSortedByVote'
import { toast } from 'react-toastify'
import { BigNumber } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'
import { commentIsConfirmed, createNote, formatDistanceToNow } from '@/lib/utils'
import { CancelButton, PrimaryButton } from '@components/buttons'
import DeleteItemButton from '@components/buttons/DeleteItemButton'
import { NewPostForm } from '@components/NewPostForm'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { ContentType, User } from '@/lib/model'
import { Item } from '@/types/contract/ForumInterface'
import { EditItemParams } from '@/hooks/useEditItem'
import { RenderPost } from '@components/Discourse/TopicPosts/RenderPost'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'

const Editor = dynamic(() => import('@components/editor-js/Editor'), {
  ssr: false,
})
export interface CommentsMap {
  [key: string]: {
    comment: any
    isSaving: boolean
    isEditable: boolean
    isEditing: boolean
  }
}

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
  rootOpen: 'fixed z-50 inset-0 p-12 bg-gray-900/50 flex justify-center items-center ',
  formBody: 'w-full h-full flex flex-col gap-4 min-h-[400px] justify-between ',
  editor:
    'border rounded-md py-2 px-3  transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 dark:text-dark-100',
  submitButton:
    'bg-green-500 text-white border-none rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600',
  formContainerOpen:
    'bg-white dark:bg-gray-900 p-6 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg w-full max-w-3xl overflow-y-auto ',
  openFormButtonOpen: 'self-end hidden',
  openFormButtonClosed:
    'h-full bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600',
}

export const PostComments = ({
  users,
  comments,
  groupId,
  postId,
  commentInstance,
  postEditorRef,
  canDelete,
  checkUserBalance,
  address,
  user,
  setIsLoading,
  identityCommitment,
  editItem,
  isLoading,
}: {
  users: User[]
  comments: Item[]
  groupId: number
  postId: number
  commentInstance: any

  postEditorRef: any
  canDelete: boolean
  checkUserBalance: () => Promise<boolean>
  address: string
  user: User
  setIsLoading: (isLoading: boolean) => void
  identityCommitment: string
  editItem: (args: EditItemParams) => Promise<void>
  isLoading: boolean
}) => {
  const [comment, setComment] = useState<OutputData | null>(null)
  const [commentsMap, setCommentsMap] = useState<CommentsMap>({} as any)
  const [tempComments, setTempComments] = useState<TempComment[]>([])
  const [editableComments, setEditableComments] = useState<string[]>([])
  const { t } = useTranslation()
  const commentEditorRef = useRef<any>()

  const [commentsSortBy, setCommentsSortBy] = useState<SortByOption>('highest')

  useEffect(() => {
    if (user && identityCommitment && comments) {
      checkIfCommentsAreEditable()
    }
  }, [user, comments, identityCommitment])

  const sortedCommentsData = useItemsSortedByVote(tempComments, comments, commentsSortBy)

  const clearInput = () => {
    setComment({
      blocks: [],
    })
    commentEditorRef?.current?.clear()
  }

  // Helper function for updating the comments map
  const updateCommentMap = (id: string, updates: Partial<CommentsMap[string]>) => {
    setCommentsMap(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updates,
      },
    }))
  }

  const validateRequirements = () => {
    if (!address) return toast.error(t('toast.error.notLoggedIn'), { type: 'error', toastId: 'min' })
    if (!user) return toast.error(t('toast.error.notJoined'), { type: 'error', toastId: 'min' })

    return true
  }
  const addComment = async () => {
    if (validateRequirements() !== true) return
    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return
    let ipfsHash = ''

    try {
      setIsLoading(true)
      const response = await commentInstance?.create(
        comment,
        address,
        users,
        user,
        groupId,
        setIsLoading,
        (comment, cid) => {
          ipfsHash = cid
          setTempComments([
            {
              id: cid,
              createdAt: new Date(),
              content: comment,
            },
            ...tempComments,
          ])
        }
      )

      if (response?.status === 200) {
        clearInput()

        // const newMessage = await getContent(getIpfsHashFromBytes32(signal))
        console.log(response)
        console.log(`Your greeting was posted 🎉`)
        toast.success(t('alert.addCommentSuccess'))
      } else {
        console.log('Some error occurred, please try again!')
        toast.error(t('alert.addCommentFailed'))
      }
    } catch (error) {
      clearInput()
      console.error(error)
      if (error?.message?.includes('ProveReputation_227')) {
        toast.error(t('error.notEnoughReputation'), { toastId: 'notEnoughReputation' })
      } else {
        toast.error(t('alert.addCommentFailed'))
      }

      console.log('Some error occurred, please try again!', error)
    } finally {
      setIsLoading(false)
      setTempComments(prevComments => {
        const tempCommentIndex = prevComments.findIndex(t => t.id === ipfsHash)
        if (tempCommentIndex > -1) {
          const tempCommentsCopy = [...prevComments]
          tempCommentsCopy.splice(tempCommentIndex, 1)
          return tempCommentsCopy
        }
        return prevComments
      })
    }
  }

  const checkIfCommentsAreEditable = async () => {
    for (const c of comments) {
      const note = c?.note
      const contentCID = c?.contentCID
      if (note && contentCID) {
        const noteBigNumber = BigNumber.from(note).toString()
        const userPosting = new Identity(`${address}_${groupId}_${user?.name}`)
        const generatedNote = await createNote(userPosting)
        const generatedNoteAsBigNumber = BigNumber.from(generatedNote).toString()

        if (generatedNoteAsBigNumber === noteBigNumber || canDelete) {
          setEditableComments(prev => [...prev, c.id])
          updateCommentMap(c.id, {
            comment: { ...(commentsMap[c.id]?.comment || c) },
            isEditable: true,
          })
        }
      }
    }
  }

  const onClickEditComment = comment => {
    updateCommentMap(comment.id, {
      isSaving: false,
      isEditing: true,
    })
  }

  const onClickCancelComment = comment => {
    updateCommentMap(comment.id, {
      isEditing: false,
    })
  }

  const saveEditedComment = async comment => {
    if (!commentInstance || !address || !user) return
    updateCommentMap(comment.id, {
      isSaving: true,
      comment: { ...comment },
    })
    setIsLoading(true)

    try {
      const commentData = commentsMap[comment.id]?.comment
      console.log('commentData', commentData)
      if (!commentData) return toast.error(t('alert.editFailed'))
      await editItem({
        content: commentData,
        itemId: comment.id,
        itemType: ContentType.COMMENT,
        note: comment.note,
      })
      toast.success(t('alert.commentEditSuccess'))
      setIsLoading(false)
      updateCommentMap(comment.id, {
        isSaving: false,
        isEditing: false,
      })
    } catch (error) {
      console.log(error)
      toast.error(t('alert.editFailed'))
      setIsLoading(false)
      updateCommentMap(comment.id, {
        isSaving: false,
      })
    }
  }

  const CommentActions = ({ comment, canDelete }) => {
    const isEditable = editableComments.includes(comment.id)
    const currentCommentMap = commentsMap[comment.id]
    const isEditing = currentCommentMap?.isEditing
    const commentContent = currentCommentMap?.comment

    return (
      <div className="flex flex-row items-center gap-4">
        {comment.id}
        {isEditable && !isEditing && (
          <PrimaryButton
            isLoading={isLoading}
            className="w-fit bg-blue-500 text-sm text-white hover:bg-blue-600"
            onClick={() => onClickEditComment(comment)}
          >
            {t('button.edit')}
          </PrimaryButton>
        )}
        {isEditing && (
          <>
            <CancelButton isLoading={isLoading} onClick={() => onClickCancelComment(comment)}>
              {t('button.cancel')}
            </CancelButton>
            <PrimaryButton
              isLoading={isLoading}
              disabled={!commentContent || !commentContent.blocks?.length}
              onClick={() => saveEditedComment(comment)}
            >
              {t('button.save')}
            </PrimaryButton>
          </>
        )}

        {(isEditable || canDelete) && !isEditing && (
          <DeleteItemButton
            isLoading={isLoading}
            itemId={comment.id}
            itemType={1}
            groupId={groupId}
            postId={postId}
            isAdminOrModerator={canDelete}
          />
        )}
      </div>
    )
  }

  const setOnEditCommentContent = (comment, content) => {
    updateCommentMap(comment.id, {
      comment: { ...comment, ...content },
    })
  }

  return (
    <>
      <NewPostForm
        editorId={`post_comment${groupId}`}
        description={comment}
        setDescription={setComment}
        handleSubmit={addComment}
        editorReference={postEditorRef}
        setTitle={() => {}}
        resetForm={() => setComment(null)}
        isEditable={true}
        isReadOnly={false}
        title={''}
        itemType={'comment'}
        actionType={'new'}
        classes={NewPostModal}
        submitButtonText={t('button.comment') || 'missing-text'}
        placeholder={t('placeholder.comment') || 'missing-text'}
        openFormButtonText={t('button.comment') || 'missing-text'}
      />

      {sortedCommentsData.map((comment, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-4 rounded-lg bg-white p-4 shadow-sm transition-colors dark:bg-gray-800"
        >
          <div key={comment.id} className="flex flex-col gap-2">
            <div className={`rounded p-2`}>
              {comment && (
                <div
                  className={`${
                    commentsMap[comment?.id]?.isEditing
                      ? 'min-h-[150px] rounded border border-solid pl-4'
                      : 'flex flex-col gap-2'
                  }`}
                >
                  {commentsMap[comment?.id]?.isEditing && (
                    <Editor
                      editorRef={commentEditorRef}
                      holder={'comment' + '_' + comment?.id}
                      readOnly={!commentsMap[comment?.id]?.isEditing}
                      onChange={val => setOnEditCommentContent(comment, val)}
                      placeholder={t('placeholder.enterComment') as string}
                      data={comment}
                    />
                  )}
                  {!commentsMap[comment?.id]?.isEditing && <EditorJsRenderer data={comment} />}
                  {(identityCommitment || canDelete) && <CommentActions comment={comment} canDelete={canDelete} />}
                </div>
              )}
            </div>
            <div className="pt-3 text-gray-600 dark:text-gray-400">
              <div
                className="flex gap-4"
                style={{
                  visibility: commentIsConfirmed(comment.id) ? 'visible' : 'hidden',
                }}
              >
                <p className="inline-block text-sm">
                  🕛 {comment?.time ? formatDistanceToNow(new Date(comment?.time).getTime()) : '-'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  )
}

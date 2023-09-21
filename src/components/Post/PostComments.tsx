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
import { NoComments } from '@components/Post/NoPosts'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { ContentType, User } from '@/lib/model'
import { Item } from '@/types/contract/ForumInterface'
import { EditItemParams } from '@/hooks/useEditItem'

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
    <div className={'flex flex-col sticky top-0'}>
      {sortedCommentsData.length === 0 && <NoComments />}

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
        classes={{
          rootOpen: 'bg-white border border-gray-200 bg-gray-200 rounded-sm h-full',
          rootClosed: '!h-32 flex flex-col justify-center items-center rounded-sm',
          formBody: 'w-full h-full  flex flex-col gap-4',
          editor: 'border  rounded py-1 px-2 bg-white',
          submitButton: 'bg-green-500 text-white border-none rounded',
          openFormButtonClosed: 'bg-green-500 text-white border-none rounded',
        }}
        submitButtonText={t('button.comment')}
        placeholder={t('placeholder.comment')}
        openFormButtonText={t('button.comment')}
      />

      {sortedCommentsData.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-4" // Tailwind class for padding
        >
          <div key={c.id} className=" flex flex-col">
            <div
              className={`rounded bg-gray-100 p-4 dark:bg-transparent ${
                commentIsConfirmed(c.id) || commentsMap[c?.id]?.isSaving
                  ? 'border border-green-400'
                  : 'border border-red-400'
              }`}
            >
              {c && (
                <div
                  className={`${commentsMap[c?.id]?.isEditing ? 'min-h-[150px] rounded border border-solid pl-4' : ''}`}
                >
                  <Editor
                    editorRef={commentEditorRef}
                    holder={'comment' + '_' + c?.id}
                    readOnly={!commentsMap[c?.id]?.isEditing}
                    onChange={val => setOnEditCommentContent(c, val)}
                    placeholder={t('placeholder.enterComment') as string}
                    data={c}
                  />
                  {(identityCommitment || canDelete) && <CommentActions comment={c} canDelete={canDelete} />}
                </div>
              )}
            </div>
            <div className="pt-3 text-gray-500">
              <div
                className="flex gap-4"
                style={{
                  visibility: commentIsConfirmed(c.id) ? 'visible' : 'hidden',
                }}
              >
                <p className=" inline-block text-sm">
                  🕛 {c?.time ? formatDistanceToNow(new Date(c?.time).getTime()) : '-'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

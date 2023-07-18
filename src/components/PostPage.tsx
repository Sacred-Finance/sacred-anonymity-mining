import { useActiveUser, useCommunityById, useCommunityContext, useUserIfJoined } from '@/contexts/CommunityProvider'
import { useAccount, useContractWrite } from 'wagmi'
import { useLoaderContext } from '@/contexts/LoaderContext'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import { forumContract, ForumContractAddress } from '@/constant/const'
import ForumABI from '@/constant/abi/Forum.json'
import { setCacheAtSpecificPath } from '@/lib/redis'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useRef, useState } from 'react'
import { OutputData } from '@editorjs/editorjs'
import { CommentClass } from '@/lib/comment'
import useSWR, { useSWRConfig } from 'swr'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { Identity } from '@semaphore-protocol/identity'
import { commentIsConfirmed, createNote, formatDistanceToNow } from '@/lib/utils'
import { BigNumber } from 'ethers'
import { toast } from 'react-toastify'
import { SortByOption } from '@components/SortBy'
import { useItemsSortedByVote } from '@/hooks/useItemsSortedByVote'
import { NewPostForm } from '@components/NewPostForm'
import { motion } from 'framer-motion'
import { CircularProgress } from '@components/CircularProgress'
import dynamic from 'next/dynamic'
import { useRemoveItemFromForumContract } from '@/hooks/useRemoveItemFromForumContract'

const Editor = dynamic(() => import('@/components/editor-js/Editor'), {
  ssr: false,
})

interface PostProps {
  users: any[]
}

interface CommentsMap {
  [key: string]: {
    comment: any
    isSaving: boolean
    isEditable: boolean
    isEditing: boolean
  }
}

interface TempComment {
  id: string
  createdAt: Date
  content: string
}


export function PostPage({ postInstance, postId, groupId }) {
  const hasUserJoined = useUserIfJoined(groupId)
  const activeUser = useActiveUser({ groupId })
  const { state } = useCommunityContext()
  const { users, communities } = state
  const community = useCommunityById(groupId)

  const { address } = useAccount()
  const { isLoading, setIsLoading } = useLoaderContext()

  const { isAdmin, isModerator, fetchIsAdmin, fetchIsModerator } = useCheckIfUserIsAdminOrModerator(address)

  const canDelete = isAdmin || isModerator
  const commentClassInstance = useRef<CommentClass>(null)

  useEffect(() => {
    commentClassInstance.current = new CommentClass(groupId, postId, null)
    fetchIsAdmin()
  }, [groupId, postId])

  const { data, write } = useRemoveItemFromForumContract(
    ForumContractAddress,
    ForumABI,
    forumContract,
    postInstance,
    commentClassInstance,
    setIsLoading
  )

  const { t } = useTranslation()

  const [comment, setComment] = useState<OutputData>(null)
  const [commentsMap, setCommentsMap] = useState<CommentsMap>({} as any)
  const [tempComments, setTempComments] = useState<TempComment[]>([])

  const [isPostEditable, setIsPostEditable] = useState(false)
  const [isPostEditing, setPostEditing] = useState(false)
  const [isPostBeingSaved, setPostBeingSaved] = useState(false)
  const [editableComments, setEditableComments] = useState<string[]>([])

  const [postTitle, setPostTitle] = useState('')
  const [postDescription, setPostDescription] = useState<OutputData>(null)

  const commentEditorRef = useRef<any>()

  const identityCommitment = hasUserJoined ? BigInt(hasUserJoined?.identityCommitment?.toString()) : null

  const { data: comments, isLoading: commentsLoading } = useSWR(
    commentClassInstance?.current?.commentsCacheId?.(),
    fetchComments,
    {
      revalidateOnFocus: false,
    },
  )


  useEffect(() => {
    if (hasUserJoined && identityCommitment && comments) {
      checkIfCommentsAreEditable()
    }
  }, [hasUserJoined, comments])
  const { validationResult, checkUserBalance } = useValidateUserBalance(community, address)

  const checkIfPostIsEditable = async (note, contentCID) => {
    const userPosting = new Identity(`${address}_${groupId}_${hasUserJoined?.name}`)
    const generatedNote = await createNote(userPosting)
    const generatedNoteAsBigNumber = BigNumber.from(generatedNote).toString()
    const noteBigNumber = BigNumber.from(note).toString()

    setIsPostEditable(noteBigNumber === generatedNoteAsBigNumber)
  }




  async function fetchComments() {
    console.log('test-log', 'fetching comments')
    const comments = await commentClassInstance?.current?.getComments()
    return comments
  }

  const onClickEditPost = async () => {
    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return
    setPostEditing(true)
  }



  const deleteItem = async (itemId, itemType: number) => {
    if (itemType !== 0 && itemType !== 1) return toast.error(t('alert.deleteFailed'))
    if (validateRequirements() !== true) return
    setIsLoading(true)
    await fetchIsAdmin()
    if (canDelete) {
      write({
        recklesslySetUnpreparedArgs: [+itemId],
      })
    } else {
      try {
        const { status } =
          itemType === 0
            ? await postInstance?.current?.delete(address, postId, users, hasUserJoined, groupId, setIsLoading)
            : await commentClassInstance?.current?.delete(address, postId, users, hasUserJoined, groupId, setIsLoading)
        if (status === 200) {
          toast.success(t('alert.deleteSuccess'))
          if (itemType === 0) {
            // navigate('../../', { relative: 'path' })
          }
          setIsLoading(false)
        }
      } catch (error) {
        console.log(error)
        toast.error(t('alert.deleteFailed'))
        if (itemType === 0) {
          // navigate('../../', { relative: 'path' })
        }
        setIsLoading(false)
      }
    }
  }

  const clearInput = () => {
    setComment({
      blocks: [],
    })
    commentEditorRef?.current?.clear()
  }

  const validateRequirements = () => {
    if (!address) return toast.error(t('toast.error.notLoggedIn'), { type: 'error', toastId: 'min' })
    if (!hasUserJoined) return toast.error(t('toast.error.notJoined'), { type: 'error', toastId: 'min' })

    return true
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



  const addComment = async () => {
    console.log(groupId, 'groupId')
    if (validateRequirements() !== true) return
    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return
    let ipfsHash = ''

    try {
      setIsLoading(true)
      //don't await. Create it. If succees, update redis with success, else delete redis
      const { status } = await commentClassInstance?.current?.create(
        comment,
        address,
        users,
        hasUserJoined,
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

      if (status === 200) {
        clearInput()
        // const newMessage = await getContent(getIpfsHashFromBytes32(signal))
        console.log(`Your greeting was posted 🎉`)
        toast.success(t('alert.addCommentSuccess'))
      } else {
        console.log('Some error occurred, please try again!')
        toast.error(t('alert.addCommentFailed'))
      }
    } catch (error) {
      console.error(error)
      toast.error(t('alert.addCommentFailed'))

      console.log('Some error occurred, please try again!')
    } finally {
      setIsLoading(false)
      setTempComments(prevComments => {
        const tempCommentIndex = prevComments.findIndex(t => t.id === ipfsHash)
        if (tempCommentIndex > -1) {
          const tempCommentsCopy = [...prevComments]
          tempCommentsCopy.splice(tempCommentIndex, 1)
          return tempCommentsCopy
        }
        return prevComments // return the previous state if no comment is found with the given ipfsHash
      })

    }
  }

  const checkIfCommentsAreEditable = async () => {
    for (const c of comments) {
      const note = c?.note
      const contentCID = c?.contentCID
      if (note && contentCID) {
        const noteBigNumber = BigNumber.from(note).toString()
        const userPosting = new Identity(`${address}_${groupId}_${hasUserJoined?.name}`)
        const generatedNote = await createNote(userPosting)
        const generatedNoteAsBigNumber = BigNumber.from(generatedNote).toString()

        console.log('test-log comments', generatedNoteAsBigNumber, noteBigNumber)
        if (generatedNoteAsBigNumber === noteBigNumber) {
          setEditableComments(prev => [...prev, c.id])
          // updateCommentMap(c.id, {
          //   comment: { ...(commentsMap[c.id]?.comment || c) },
          //   isEditable: true,
          // })
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

  const setOnEditCommentContent = (comment, content) => {
    updateCommentMap(comment.id, {
      comment: { ...comment, content },
    })
  }

  const onClickCancelComment = comment => {
    updateCommentMap(comment.id, {
      isEditing: false,
    })
  }

  const saveEditedComment = async comment => {
    if (!commentClassInstance.current || !address || !hasUserJoined) return
    updateCommentMap(comment.id, {
      isSaving: true,
      comment: { ...comment },
    })
    setIsLoading(true)

    try {
      const { status } = await commentClassInstance.current.edit(
          commentsMap[comment.id]?.comment,
          address,
          comment.id,
          hasUserJoined,
          groupId,
          setIsLoading
      )

      if (status === 200) {
        toast.success(t('alert.commentEditSuccess'))
        setIsLoading(false)
        updateCommentMap(comment.id, {
          isSaving: false,
          isEditing: false,
        })
      }
    } catch (error) {
      console.log(error)
      toast.error(t('alert.editFailed'))
      setIsLoading(false)
      updateCommentMap(comment.id, {
        isSaving: false,
      })
    }
  }


  const voteForPost = async (postId, voteType: 0 | 1) => {
    if (!hasUserJoined) return
    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return
    setIsLoading(true)

    try {
      postInstance?.current
        ?.updatePostsVote(postInstance.current, postId, voteType, false)
        .then(() => setIsLoading(false))
      const { status } = await postInstance?.current?.vote(voteType, address, users, activeUser, postId, groupId)

      if (status === 200) {
        setIsLoading(false)
      }
    } catch (error) {
      postInstance?.current?.updatePostsVote(postInstance.current, postId, voteType, true, true)
      setIsLoading(false)
    }
  }

  const [commentsSortBy, setCommentsSortBy] = useState<SortByOption>('highest')

  const handleCommentsSortChange = (newSortBy: SortByOption) => {
    setCommentsSortBy(newSortBy)
  }

  const CommentActions = ({ comment, canDelete }) => {
    const isEditable = editableComments.includes(comment.id);
    const currentCommentMap = commentsMap[comment.id];
    const isEditing = currentCommentMap?.isEditing;
    const commentContent = currentCommentMap?.comment?.content;

    return (
        <div className="mt-3 flex flex-row gap-4">
          {isEditable && !isEditing && (
              <button onClick={() => onClickEditComment(comment)}>{t('button.edit')}</button>
          )}
          {isEditing && (
              <>
                <button onClick={() => onClickCancelComment(comment)}>{t('button.cancel')}</button>
                <button
                    disabled={!commentContent || !commentContent.blocks?.length}
                    onClick={() => saveEditedComment(comment)}
                >
                  {t('button.save')}
                </button>
              </>
          )}
          {(currentCommentMap?.isEditable || canDelete) && !isEditing && (
              <button className="text-small color-[red.500]" onClick={() => deleteItem(comment.id, 1)}>
                {t('button.delete')}
              </button>
          )}
        </div>
    );
  }

  const sortedCommentsData = useItemsSortedByVote(tempComments, comments, commentsSortBy)

  return (
    <>
      <NewPostForm
        id={`post_comment${groupId}`}
        postTitle={false}
        isComment={true}
        postDescription={comment}
        setPostDescription={setComment}
        isLoading={isLoading}
        addPost={addComment}
        postEditorRef={undefined}
        setPostTitle={undefined}
        clearInput={() => setComment(null)}
      />
      {sortedCommentsData.map((c, i) => (
          <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="p-4" // Tailwind class for padding
          >
            <div key={c.id} className="flex flex-col mb-8">
              <div className={`bg-gray-100 dark:bg-transparent p-4 rounded-md ${commentIsConfirmed(c.id) || commentsMap[c?.id]?.isSaving ? 'border border-green-400' : 'border border-red-400'}`}>
                {c?.content && (
                    <div className={`mt-4 ${commentsMap[c?.id]?.isEditing ? 'min-h-[150px] rounded-md border border-solid pl-4' : ''}`}>
                      <Editor
                          editorRef={commentEditorRef}
                          holder={'comment' + '_' + c?.id}
                          readOnly={!commentsMap[c?.id]?.isEditing}
                          onChange={val => setOnEditCommentContent(c, val)}
                          placeholder={t('placeholder.enterComment') as string}
                          data={c?.content?.blocks ? c?.content : []}
                      />
                      {(Boolean(identityCommitment) || canDelete) && <CommentActions comment={c} canDelete={canDelete} />}
                    </div>
                )}
              </div>
              <div className="pt-3 text-gray-500">
                <div
                    className="flex gap-3"
                    style={{
                      visibility: commentIsConfirmed(c.id) ? 'visible' : 'hidden',
                    }}
                >
                  <div>{/* Your VoteUpButton and VoteDownButton components code */}</div>
                  <p className="my-auto inline-block text-sm">
                    🕛 {c?.createdAt ? formatDistanceToNow(new Date(c?.createdAt).getTime(), { addSuffix: true }) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
      ))}

      {isPostBeingSaved && <CircularProgress className={'h-10 w-10'} />}
      {isPostEditing ? (
        <div className={'flex flex-col items-center justify-center'}>
          <div className="flex flex-col items-center rounded bg-white bg-opacity-50 p-4">
            <input id={'postTitle'} value={postTitle} onChange={e => setPostTitle(e.target.value)} />
            <textarea
              id={'postDescription'}
              value={postDescription}
              onChange={e => setPostDescription(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className={'flex flex-col items-center justify-center'}>
          <div className="flex flex-col items-center rounded bg-white bg-opacity-50 p-4">
            {/*<h1 className="text-2xl font-bold text-black">{postFetched?.name}</h1>*/}
          </div>
        </div>
      )}
    </>
  )
}

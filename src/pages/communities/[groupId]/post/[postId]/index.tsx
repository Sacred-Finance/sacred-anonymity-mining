import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import { useCreateCommunity } from '@/hooks/useCreateCommunity'
import Header from '../../../../../components/Header'
import { CustomModal } from '@components/CustomModal'
import CreateGroupFormUI from '../../../../../components/CreateGroupFormUI'
import Footer from '../../../../../components/Footer'
import { useSortedVotes } from '@/hooks/useSortedVotes'
import { SortByOption } from '@components/SortBy'
import { commentIsConfirmed, createNote, formatDistanceToNow, getBytes32FromIpfsHash, hashBytes } from '@/lib/utils'
import useSWR, { useSWRConfig } from 'swr'
import { OutputData } from '@editorjs/editorjs'
import { CommentClass } from '@/lib/comment'
import { Post, PostInterface } from '@/lib/post'
import { useAccount, useContractWrite } from 'wagmi'
import { useLoaderContext } from '@/contexts/LoaderContext'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import { forumContract, ForumContractAddress } from '@/constant/const'

import ForumABI from '../../../../../constant/abi/Forum.json'
import { useTranslation } from 'next-i18next'
import { setCacheAtSpecificPath } from '@/lib/redis'
import { PostContent, User } from '@/lib/model'
import { useUnirepSignUp } from '@/hooks/useUnirepSignup'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { BigNumber } from 'ethers'
import { toast } from 'react-toastify'
import { useActiveUser, useCommunityContext, useUserIfJoined } from '@/contexts/CommunityProvider'
import _ from 'lodash'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '@components/Breadcrumbs'
import { Main } from 'src/pages/communities/[groupId]'
import { CircularProgress } from '@components/CircularProgress'
import { Identity } from '@semaphore-protocol/identity'
import { NewPostForm } from '@components/NewPostForm'
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

export function PostPage() {
  const router = useRouter()
  const { groupId, postId } = router.query
  const hasUserJoined = useUserIfJoined(groupId)
  const { state } = useCommunityContext()
  const { users, communities } = state

  const community = communities.find(c => c.id.toString() === groupId)

  const { address } = useAccount()
  const { isLoading, setIsLoading } = useLoaderContext()

  const { isAdmin, isModerator, fetchIsAdmin, fetchIsModerator } = useCheckIfUserIsAdminOrModerator(address)

  const canDelete = isAdmin || isModerator
  const activeUser = useActiveUser()

  const { data, write } = useContractWrite({
    address: ForumContractAddress as `0x${string}`,
    abi: ForumABI.abi,
    functionName: 'removeItem',
    mode: 'recklesslyUnprepared',
    onSettled: (data, error) => {
      console.log('test-log', { data, error })
      setIsLoading(false)
    },
    onSuccess: async (data, variables) => {
      try {
        const tx = await data.wait()
        const itemId = variables.args[0]
        const item = await forumContract.itemAt(itemId)
        if (item.kind == 0) {
          await setCacheAtSpecificPath(postInstance?.current?.specificPostId(itemId), true, '$.removed')
          // navigate('../../', { relative: 'path' })
        } else if (item.kind == 1) {
          await setCacheAtSpecificPath(commentClassInstance.current.specificCommentId(itemId), true, '$.removed')
          mutate(
            commentClassInstance.current.commentsCacheId(),
            data => {
              const commentsListCopy = [...data]
              const i = commentsListCopy.findIndex(c => +c.id === itemId)
              commentsListCopy.splice(i, 1)
              return commentsListCopy
            },
            { revalidate: false }
          )
        }
        setIsLoading(false)
      } catch (error) {
        console.log(error)
        setIsLoading(false)
      }
    },
  })

  const { t } = useTranslation()

  const [comment, setComment] = useState<OutputData>(null)
  const [commentsMap, setCommentsMap] = useState<CommentsMap>({} as any)

  console.log('test-log', { comment, commentsMap })

  const [isPostEditable, setIsPostEditable] = useState(false)
  const [isPostEditing, setPostEditing] = useState(false)
  const [isPostBeingSaved, setPostBeingSaved] = useState(false)

  const [postTitle, setPostTitle] = useState('')
  const [postDescription, setPostDescription] = useState<OutputData>(null)

  const commentEditorRef = useRef<any>()
  const postEditorRef = useRef<any>()

  const identityCommitment = hasUserJoined ? BigInt(hasUserJoined?.identityCommitment?.toString()) : null

  const postInstance = useRef<Post>(null)

  // Only update postInstance if id changes
  useEffect(() => {
    if (groupId && postId) postInstance.current = new Post(postId, groupId)
  }, [groupId, postId])

  // commentClassInstance = new CommentClass(id, postId, null)
  const commentClassInstance = useRef<CommentClass>(null)
  useEffect(() => {
    commentClassInstance.current =
        new CommentClass(groupId, postId, null)
  }, [groupId, postId])

  useUnirepSignUp({ groupId: groupId, name: hasUserJoined?.name })

  const { mutate } = useSWRConfig()

  const { data: postFetched, isLoading: postLoading } = useSWR(postInstance?.current?.postCacheId?.(), fetchPost, {
    revalidateOnFocus: false,
    // isOnline: () => !!postInstance?.current?.postCacheId?.(),
  })

  const { data: comments, isLoading: commentsLoading } = useSWR(
    commentClassInstance?.current?.commentsCacheId?.(),
    fetchComments,
    {
      revalidateOnFocus: false,
    }
  )

  const [tempComments, setTempComments] = useState([])

  useEffect(() => {
    if (postEditorRef?.current) postEditorRef?.current?.reRender?.()
  }, [postFetched])

  useEffect(() => {
    if (hasUserJoined && identityCommitment) {
      checkIfCommentsAreEditable()
    }
  }, [hasUserJoined, comments])
  const { validationResult, checkUserBalance } = useValidateUserBalance(community, address)
  const checkIfPostIsEditable = async (note, contentCID) => {
    const userPosting = new Identity(`${address}_${groupId}_${hasUserJoined?.name}`)
    const generatedNote = await createNote(userPosting)
    const noteBigNumber = BigNumber.from(note).toString()
    const generatedNoteAsBigNumber = BigNumber.from(generatedNote).toString()
    setIsPostEditable(noteBigNumber === generatedNoteAsBigNumber)
  }

  const checkIfCommentsAreEditable = async () => {
    comments?.forEach(async c => {
      const note = c?.note
      const contentCID = c?.contentCID
      if (note && contentCID) {
        const noteBigNumber = BigNumber.from(note).toString()
        const userPosting = new Identity(`${address}_${groupId}_${hasUserJoined?.name}`)
        const generatedNote = await createNote(userPosting)
        const generatedNoteAsBigNumber = BigNumber.from(generatedNote).toString()
        if (generatedNoteAsBigNumber === noteBigNumber) {
          setCommentsMap(prevCommentsMap => {
            return {
              ...prevCommentsMap,
              [c.id]: prevCommentsMap[c.id]
                ? { ...prevCommentsMap[c.id], isEditable: true }
                : { comment: { ...c }, isEditable: true },
            }
          })
        }
      }
    })
  }

  async function fetchPost() {
    return await postInstance?.current?.get()
  }

  async function fetchComments() {
    const comments = await commentClassInstance?.current?.getComments()
    return comments
  }

  const checkIfUserHasJoined = (toastOnFalse = true) => {
    if (hasUserJoined) {
      return true
    } else {
      if (toastOnFalse) toast.error(t('toast.error.notJoined'), { type: 'error', toastId: 'min' })

      return false
    }
  }

  const onClickEditPost = async () => {
    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return
    setPostEditing(true)
    setPostTitle(postFetched?.title)
    setPostDescription(postFetched?.description)
  }

  const onClickEditComment = comment => {
    setCommentsMap({
      ...commentsMap,
      [comment.id]: {
        ...commentsMap[comment.id],
        isSaving: false,
        isEditing: true,
      },
    })
  }

  const setOnEditCommentContent = (comment, content) => {
    setCommentsMap(prevCommentsMap => {
      return {
        ...prevCommentsMap,
        [comment.id]: {
          ...prevCommentsMap[comment.id],
          comment: { ...comment, content },
        },
      }
    })
  }

  const onClickCancelPost = () => {
    setPostDescription(postFetched?.description)
    setPostEditing(false)
  }

  const deleteItem = async (itemId, itemType: number) => {
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

  const onClickCancelComment = comment => {
    setCommentsMap(prevCommentsMap => {
      return {
        ...prevCommentsMap,
        [comment.id]: {
          ...commentsMap[comment.id],
          isEditing: false,
        },
      }
    })
  }
  const clearInput = () => {
    setComment({
      blocks: [],
    })
    commentEditorRef?.current?.clear()
  }

  const addComment = async () => {
    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return
    if (!checkIfUserHasJoined()) return

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
      })
    }
  }
  const saveEditedComment = async comment => {
    setCommentsMap(prevCommentsMap => {
      return {
        ...prevCommentsMap,
        [comment.id]: {
          ...prevCommentsMap[comment.id],
          isSaving: true,
          comment: { ...comment },
        },
      }
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
        setCommentsMap(prevCommentsMap => {
          return {
            ...prevCommentsMap,
            [comment.id]: {
              ...prevCommentsMap[comment.id],
              isSaving: false,
              isEditing: false,
            },
          }
        })
      }
    } catch (error) {
      console.log(error)
      toast.error(t('alert.editFailed'))
      setIsLoading(false)
      setCommentsMap(prevCommentsMap => {
        return {
          ...prevCommentsMap,
          [comment.id]: { ...prevCommentsMap[comment.id], isSaving: false },
        }
      })
    }
  }

  const editPost = async () => {
    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return

    setPostBeingSaved(true)
    // setPostEditing(false);
    setIsLoading(true)

    if (!postTitle || !postDescription) {
      toast.error(t('alert.fillAllFields'))
      setIsLoading(false)
      setPostBeingSaved(false)
      return
    }

    if (_.isEqual(postFetched.title, postTitle) && _.isEqual(postFetched.description, postDescription)) {
      toast.error(t('alert.noChange'))

      setIsLoading(false)
      setPostBeingSaved(false)
      return
    }

    try {
      const postContent: PostContent = {
        title: postTitle,
        description: postDescription,
      }
      const { status } = await postInstance?.current?.edit(
        postContent,
        address,
        postId,
        users,
        hasUserJoined,
        groupId,
        setIsLoading
      )

      if (status === 200) {
        setPostEditing(false)
        toast.success(t('alert.postEditSuccess'))

        console.log(`Post Edited Successfully`)
        setIsLoading(false)
        setPostBeingSaved(false)
      }
    } catch (error) {
      console.log(error)
      toast.error(t('alert.editFailed'))

      setIsLoading(false)
      setPostBeingSaved(false)
      setPostEditing(true)
    }
  }
  const voteForPost = async (postId, voteType: 0 | 1) => {
    if (!user) return
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

  const hasUserRightsToEdit = async (note, cid) => {
    if (!note || !cid || identityCommitment) return false
    const userPosting = new Identity(`${address}_${groupId}_${hasUserJoined?.name}`)
    return createNote(userPosting).then(r => {
      return r
    })
  }

  const [commentsSortBy, setCommentsSortBy] = useState<SortByOption>('highest')

  const handleCommentsSortChange = (newSortBy: SortByOption) => {
    setCommentsSortBy(newSortBy)
  }

  const sortedCommentsData = useSortedVotes(tempComments, comments, commentsSortBy)

  return (
    <>
      <div className={'mt-6 flex flex-col space-y-4 h-full mb-20'}>

        <div className="flex w-full flex-col  justify-center">
          <NewPostForm
            id={`post_comment${groupId}`}
            postTitle={false}
            isComment={true}
            // setPostTitle={setPostTitle}
            // postEditorRef={postEditorRef}
            postDescription={comment}
            setPostDescription={setComment}
            isLoading={isLoading}
            addPost={addComment}
            postEditorRef={undefined}
            setPostTitle={undefined}
            clearInput={() => setComment(null)}
          />
        </div>
        {sortedCommentsData.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-4" // tailwind class for padding
          >
            <div key={c.id}>
              <div className="mb-8 flex flex-col">
                <div
                  className={`${
                    commentIsConfirmed(c.id) || commentsMap[c?.id]?.isSaving
                      ? 'bg-gray-100 dark:bg-transparent'
                      : 'bg-gray-100 dark:bg-transparent'
                  }`}
                >
                  {c?.content && (
                    <div
                      className={`${
                        commentsMap[c?.id]?.isEditing ? 'mt-4 min-h-[150px] rounded-md border border-solid pl-4' : ''
                      }`}
                    >
                      <Editor
                        editorRef={commentEditorRef}
                        holder={'comment' + '_' + c?.id}
                        readOnly={commentsMap[c?.id]?.isEditing === false}
                        onChange={val => setOnEditCommentContent(c, val)}
                        placeholder={t('placeholder.enterComment')}
                        data={c?.content?.blocks ? c?.content : []}
                      />
                    </div>
                  )}
                  {/*{(!commentIsConfirmed(c.id) ||*/}
                  {/*    commentsMap[c?.id]?.isSaving) && (*/}
                  {/*    // Your Progress component code*/}
                  {/*    <></>*/}
                  {/*)}*/}
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
                      🕛{' '}
                      {c?.createdAt ? formatDistanceToNow(new Date(c?.createdAt).getTime(), { addSuffix: true }) : '-'}
                    </p>
                  </div>
                  {/*{(identityCommitment || canDelete) && (*/}
                  {/*    <></>*/}
                  {/*)}*/}
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
              <h1 className="text-2xl font-bold text-black">{postFetched?.name}</h1>
            </div>
          </div>
        )}
        <>
          {/*<Editor*/}
          {/*    data={postDescription}*/}
          {/*    editorRef={postEditorRef}*/}
          {/*    onChange={setPostDescription}*/}
          {/*    placeholder={t('placeholder.enterPostContent')}*/}
          {/*    holder={groupId + ""}*/}
          {/*/>*/}
        </>
      </div>
    </>
  )
}

export default function PostIndex() {
  const [createCommunityModalOpen, setCreateCommunityModalOpen] = useState(false)
  const createCommunity = useCreateCommunity(() => setCreateCommunityModalOpen(false))

  return (
    <div className={'flex h-screen flex-col'}>
      <Header createCommunity={() => setCreateCommunityModalOpen(true)} />
      <Breadcrumbs />
      <Main>
        <PostPage />
      </Main>
      <CustomModal isOpen={createCommunityModalOpen} setIsOpen={setCreateCommunityModalOpen}>
        <CreateGroupFormUI onCreate={createCommunity} onCreateGroupClose={() => setCreateCommunityModalOpen(false)} />
      </CustomModal>
      <div className={'flex-1  '} />
      <Footer />
    </div>
  )
}

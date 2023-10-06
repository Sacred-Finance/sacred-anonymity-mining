import { useActiveUser, useCommunityContext, useUserIfJoined } from '@/contexts/CommunityProvider'
import { useAccount } from 'wagmi'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useRef, useState } from 'react'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { BigNumber } from 'ethers'
import { toast } from 'react-toastify'
import { CommunityCard } from '@components/CommunityCard/CommunityCard'
import { VoteDownButton, VoteUpButton } from '@components/buttons'
import { useEditItem } from '@/hooks/useEditItem'
import SummaryButton from '@components/buttons/AIPostSummaryButton'
import { OutputDataToHTML } from '@components/Discourse/OutputDataToMarkDown'
import { PostItem } from '@components/Post/PostItem'
import { NewPostModal, PostComments, TempComment } from '@components/Post/PostComments'
import { Tab } from '@headlessui/react'
import { PencilIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/router'
import { ChatIcon, InfoIcon, PollIcon } from '@components/CommunityActionTabs'
import clsx from 'clsx'
import { NewPostForm } from '@components/NewPostForm'
import { OutputData } from '@editorjs/editorjs'
import { useItemsSortedByVote } from '@/hooks/useItemsSortedByVote'
import { SortByOption } from '@components/SortBy'
import { Group, Item } from '@/types/contract/ForumInterface'
import { CommentClass } from '@/lib/comment'
import { Post } from '@/lib/post'
import { User } from '@/lib/model'
import CreatePollUI from '@components/CreatePollUI'
import ToolTip from '@components/HOC/ToolTip'

export function PostPage({
  postInstance,
  comments,
  post,
  community,
  commentInstance,
}: {
  postInstance: Post
  groupId: any
  comments: Item[]
  post: Item
  community: Group
  commentInstance: CommentClass
}) {
  const user = useUserIfJoined(post.groupId)
  const activeUser = useActiveUser({ groupId: post.groupId })
  const { state } = useCommunityContext()
  const { users } = state
  const postId = post.parentId

  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)

  const { isAdmin, isModerator, fetchIsAdmin, fetchIsModerator } = useCheckIfUserIsAdminOrModerator(address)
  const { editItem } = useEditItem({
    item: post,
    isAdminOrModerator: isAdmin || isModerator,
    setIsLoading: setIsLoading,
  })
  const canDelete = isAdmin || isModerator
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchIsAdmin()
        await fetchIsModerator()
      } catch (error) {
        console.error('Failed to fetch user roles:', error)
      }
    }
    fetchData()
  }, [postId, address])

  const { t } = useTranslation()
  const [tempComments, setTempComments] = useState<TempComment[]>([])

  const commentEditorRef = useRef<any>()
  const [commentsSortBy, setCommentsSortBy] = useState<SortByOption>('highest')

  const identityCommitment = user ? BigInt(user?.identityCommitment?.toString()) : null

  const { checkUserBalance } = useValidateUserBalance(community, address)

  const router = useRouter()

  const voteForPost = async (postId, voteType: 0 | 1) => {
    if (!user) return
    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return
    setIsLoading(true)

    try {
      const { status } = await postInstance?.vote(voteType, address, users, activeUser, postId, groupId)

      if (status === 200) {
        setIsLoading(false)
        postInstance?.updatePostsVote(postInstance, postId, voteType, false)
      } else {
        toast(t('alert.voteFailed'))
      }
    } catch (error) {
      console.log(error)
      toast(t('alert.voteFailed'))
      setIsLoading(false)
    }
  }

  const [comment, setComment] = useState<OutputData | null>(null)

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
        user as User,
        post.groupId,
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
        toast.success(t('alert.commentCreateSuccess'))
      } else {
        toast.error(t('alert.addCommentFailed'))
      }
    } catch (error) {
      clearInput()
      if (error?.message?.includes('ProveReputation_227')) {
        toast.error(t('error.notEnoughReputation'), { toastId: 'notEnoughReputation' })
      } else {
        toast.error(t('alert.addCommentFailed'))
      }
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

  const clearInput = () => {
    setComment({
      blocks: [],
    })
    commentEditorRef?.current?.clear()
  }

  const sortedCommentsData = useItemsSortedByVote(tempComments, comments, commentsSortBy)

  return (
    <div className="flex h-screen w-full flex-col transition-colors dark:bg-gray-800">
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full flex-wrap sm:flex-col-reverse md:flex-row">
          <div className="flex w-full flex-col space-y-3 p-3 md:w-1/2">
            <div className="sticky top-0 z-10 flex  gap-4 border-b p-3 dark:border-gray-700 dark:bg-gray-900">
              <VoteUpButton
                isConnected={!!address}
                isJoined={!!user}
                isLoading={isLoading}
                onClick={e =>
                  handleVote({
                    e,
                    vote: 'upvote',
                    voteForPost,
                    id: post.id,
                    setIsLoading,
                  })
                }
                disabled={isLoading || !address}
              >
                <span className="font-bold text-white dark:text-gray-300">{post.upvote}</span>
              </VoteUpButton>
              <VoteDownButton
                isConnected={!!address}
                isJoined={!!user}
                isLoading={isLoading}
                onClick={e =>
                  handleVote({
                    e,
                    vote: 'downvote',
                    voteForPost,
                    id: post.id,
                    setIsLoading,
                  })
                }
                disabled={isLoading || !address}
              >
                <span className="font-bold text-white dark:text-gray-300">{post.downvote}</span>
              </VoteDownButton>
              <SummaryButton postData={OutputDataToHTML(post?.description)} postTitle={post.title} />
            </div>

            <div className="flex-1 overflow-y-auto">
              <PostItem post={post} />
            </div>
          </div>

          {/* Tabs Section */}
          <div className=" flex-1 flex-col space-y-3 p-3 md:flex md:w-1/2">
            <Tab.Group>
              <Tab.List className="sticky top-0 z-10 flex justify-between gap-2 rounded-t border-b border-b-primary-500 bg-white p-3 dark:border-gray-700 dark:bg-gray-900 ">
                <div>
                  <Tab
                    className={({ selected }) =>
                      `rounded p-2 text-gray-600    dark:text-white ${
                        selected ? 'bg-primary-400 dark:bg-gray-800' : ' '
                      }`
                    }
                  >
                    <ToolTip tooltip={'Community Info'}>
                      <InfoIcon />
                    </ToolTip>
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `rounded p-2 text-gray-600 dark:text-white ${selected ? 'bg-primary-400 dark:bg-gray-800' : ' '}`
                    }
                  >
                    <ToolTip tooltip={'Polls'}>
                      <PollIcon className={'h-5 w-5'} />
                    </ToolTip>
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `rounded p-2 text-gray-600 dark:text-white ${selected ? 'bg-primary-400 dark:bg-gray-800' : ''}`
                    }
                  >
                    <ToolTip tooltip={'All Replies'}>
                      <ChatIcon className={'h-5 w-5'} />
                    </ToolTip>
                  </Tab>
                </div>
              </Tab.List>
              <div className="overflow-y-auto max-h-screen pb-40">
                <Tab.Panels>
                  <Tab.Panel
                    className={clsx('scrollbar max-h-[calc(90vh - 200px)] col-span-12 flex w-full flex-col gap-2')}
                  >
                    <CommunityCard
                      variant={'banner'}
                      community={community}
                      actions={[
                        {
                          label: 'Edit',
                          icon: <PencilIcon className={'h-full w-4'} />,
                          onClick: () => router.push(`/communities/${community?.groupId}/edit`),
                        },
                      ]}
                    />
                  </Tab.Panel>
                  <Tab.Panel
                    className={clsx('scrollbar max-h-[calc(90vh - 200px)] col-span-12 flex w-full flex-col gap-2')}
                  >
                    <div className={'flex gap-2'}>
                      <CreatePollUI groupId={post.groupId} />
                    </div>
                    {!sortedCommentsData.length && (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="text-md">No Polls yet</div>
                      </div>
                    )}
                  </Tab.Panel>
                  <Tab.Panel
                    className={clsx('scrollbar max-h-[calc(90vh - 200px)] col-span-12 flex w-full flex-col gap-2')}
                  >
                    <div className={'flex gap-2'}>
                      <NewPostForm
                          editorId={`post_comment${post.groupId}`}
                          description={comment}
                          setDescription={setComment}
                          handleSubmit={addComment}
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

                      <CreatePollUI groupId={post.groupId} />
                    </div>
                    {sortedCommentsData.length ? <PostComments comments={sortedCommentsData} /> : null}
                    {!sortedCommentsData.length && (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="text-md">No comments yet</div>
                      </div>
                    )}
                  </Tab.Panel>
                </Tab.Panels>
              </div>
            </Tab.Group>
          </div>
        </div>
      </div>
    </div>
  )
}

interface HandleVoteParams {
  e: any
  vote: 'upvote' | 'downvote'
  voteForPost: any
  id: any
  setIsLoading: any
}

export const handleVote = async ({ e, vote, voteForPost, id, setIsLoading }: HandleVoteParams): Promise<void> => {
  e.stopPropagation()
  e.preventDefault()
  if (isNaN(id)) {
    toast.error('Invalid post id')
    return
  }
  setIsLoading(true)
  const val = vote === 'upvote' ? 0 : 1
  const voteResponse = await voteForPost(BigNumber.from(id).toNumber(), val)
  if (voteResponse) {
    console.log('voteResponse', voteResponse)
  }
  setIsLoading(false)
}
export const SplitContent = ({ children, ...props }) => (
  <div
    {...props}
    className={clsx('scrollbar max-h-[calc(90vh - 200px)] col-span-12 gap-2 overflow-y-auto md:col-span-5')}
  >
    {children}
  </div>
)

import { useActiveUser, useCommunityContext, useUserIfJoined } from '@/contexts/CommunityProvider'
import { useAccount } from 'wagmi'
import { useLoaderContext } from '@/contexts/LoaderContext'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useRef } from 'react'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { BigNumber } from 'ethers'
import { toast } from 'react-toastify'
import { CommunityCard } from '@components/CommunityCard/CommunityCard'
import { VoteDownButton, VoteUpButton } from '@components/buttons'
import { useEditItem } from '@/hooks/useEditItem'
import SummaryButton from '@components/buttons/AIPostSummaryButton'
import { OutputDataToHTML } from '@components/Discourse/OutputDataToMarkDown'
import { PostItem } from '@components/Post/PostItem'
import { PostComments } from '@components/Post/PostComments'
import { Tab } from '@headlessui/react'
import { PencilIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/router'
import {ChatIcon, InfoIcon, PollIcon} from '@components/CommunityActionTabs'

export function PostPage({ kind, postInstance, postId, groupId, comments, post, community, commentInstance }) {
  const user = useUserIfJoined(groupId)
  const activeUser = useActiveUser({ groupId })
  const { state } = useCommunityContext()
  const { users } = state

  const { address } = useAccount()
  const { isLoading, setIsLoading } = useLoaderContext()

  const { isAdmin, isModerator, fetchIsAdmin, fetchIsModerator } = useCheckIfUserIsAdminOrModerator(address)
  const { editItem } = useEditItem({
    postId,
    groupId: groupId,
    isAdminOrModerator: isAdmin || isModerator,
    setIsLoading: setIsLoading,
  })
  const canDelete = isAdmin || isModerator
  useEffect(() => {
    fetchIsAdmin()
    fetchIsModerator()
  }, [groupId, postId, address])

  const { t } = useTranslation()

  const postEditorRef = useRef<any>()

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
  return (
    <div className="h-screen w-full  transition-colors ">
      <div className="grid grid-cols-12 gap-6">
        <SplitContent>
          <PostItem post={post} />
        </SplitContent>
        <SplitContent>
          <Tab.Group>
            <Tab.List className="ml-2 flex w-fit space-x-4 rounded-t border-b border-b-primary-500 bg-gray-200 p-1 dark:bg-gray-500">
              <Tab
                className={({ selected }) =>
                  `rounded p-2 text-gray-600 dark:text-white ${selected ? 'bg-primary-400 dark:bg-gray-800' : ' '}`
                }
              >
           <InfoIcon/>

              </Tab>
              <Tab
                className={({ selected }) =>
                  `rounded p-2 text-gray-600 dark:text-white ${selected ? 'bg-primary-400 dark:bg-gray-800' : ' '}`
                }
              >
                <PollIcon className={'h-5 w-5'} />
              </Tab>
              <Tab
                className={({ selected }) =>
                  `rounded p-2 text-gray-600 dark:text-white ${selected ? 'bg-primary-400 dark:bg-gray-800' : ''}`
                }
              >
                 <ChatIcon className={'h-5 w-5'} />
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
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
                className={
                  'relative flex aspect-4 transform cursor-default flex-col justify-between rounded-lg bg-white p-2 text-gray-900 shadow-md shadow-primary-900 transition-transform  hover:bg-gray-100 dark:bg-gray-950/20 dark:text-gray-100 dark:shadow-primary-900 dark:hover:bg-gray-800 '
                }
              >
                <div className="flex flex-col gap-6">
                  <div className="text-md">Polls</div>
                </div>
              </Tab.Panel>
              <Tab.Panel
                className={
                  'relative flex aspect-4 transform cursor-default flex-col justify-between rounded-lg bg-white p-2 text-gray-900 shadow-md shadow-primary-900 transition-transform  hover:bg-gray-100 dark:bg-gray-950/20 dark:text-gray-100 dark:shadow-primary-900 dark:hover:bg-gray-800 '
                }
              >
                <PostComments
                  users={users}
                  comments={comments}
                  groupId={groupId}
                  postId={postId}
                  commentInstance={commentInstance}
                  postEditorRef={postEditorRef}
                  canDelete={canDelete}
                  checkUserBalance={checkUserBalance}
                  address={address}
                  user={user}
                  setIsLoading={setIsLoading}
                  identityCommitment={identityCommitment}
                  editItem={editItem}
                  isLoading={isLoading}
                />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

          <div className=" mt-2 flex justify-between border-b pb-4 dark:border-gray-700">
            <div className="flex items-center gap-4">
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
            </div>
            <SummaryButton postData={OutputDataToHTML(post?.description)} postTitle={post.title} />
          </div>
        </SplitContent>
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

export const SplitContent = ({ children }) => <div className="col-span-12 gap-2 md:col-span-6">{children}</div>

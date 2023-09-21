import { useActiveUser, useCommunityContext, useUserIfJoined } from '@/contexts/CommunityProvider'
import { useAccount } from 'wagmi'
import { useLoaderContext } from '@/contexts/LoaderContext'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useRef, useState } from 'react'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { BigNumber } from 'ethers'
import { toast } from 'react-toastify'
import { CommunityCard } from '@components/CommunityCard/CommunityCard'

import clsx from 'clsx'
import { VoteDownButton, VoteUpButton } from '@components/buttons'
import ReputationCard from '@components/ReputationCard'
import { useEditItem } from '@/hooks/useEditItem'
import { CommunityActionTabs } from '@components/CommunityActionTabs'
import SummaryButton from '@components/buttons/AIPostSummaryButton'
import { OutputDataToHTML } from '@components/Discourse/OutputDataToMarkDown'
import { PostItem } from '@components/Post/postItem'
import { PostComments } from '@components/Post/PostComments'

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
    <div className={clsx('h-full min-h-screen w-full space-y-4 !text-gray-900')}>
      <div className={'grid h-full grid-cols-12'}>
        <div className={'col-span-12 bg-gray-50 md:col-span-6'}>
          <PostItem post={post} />
        </div>

        <div className={'col-span-12 max-h-full overflow-y-scroll md:col-span-6'}>
          <CommunityActionTabs
            defaultTab={'chat'}
            tabs={{
              community: {
                hidden: false,
                onClick: () => {},
                panel: (
                  <div className={'flex w-full flex-col'}>
                    <div className={'flex justify-between pb-2'}>
                      <div className={'flex items-center'}>
                        <VoteUpButton
                          isConnected={!!address}
                          isJoined={!!user}
                          isLoading={isLoading}
                          onClick={e =>
                            handleVote({
                              e: e,
                              vote: 'upvote',
                              voteForPost,
                              id: post.id,
                              setIsLoading,
                            })
                          }
                          disabled={isLoading || !address}
                        >
                          <span className="font-bold text-gray-700">{post.upvote}</span>
                        </VoteUpButton>

                        <VoteDownButton
                          isConnected={!!address}
                          isJoined={!!user}
                          isLoading={isLoading}
                          onClick={e =>
                            handleVote({
                              e: e,
                              vote: 'downvote',
                              voteForPost,
                              id: post.id,
                              setIsLoading,
                            })
                          }
                          disabled={isLoading || !address}
                        >
                          <span className="font-bold text-gray-700">{post.downvote}</span>
                        </VoteDownButton>
                      </div>

                      <SummaryButton postData={OutputDataToHTML(post?.description)} postTitle={post.title} />
                    </div>

                    <CommunityCard community={community} isAdmin={false} variant={'banner'} />
                  </div>
                ),
              },
              chat: {
                hidden: false,
                onClick: () => {},
                panel: (
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
                ),
              },
              gas: {
                hidden: false,
                onClick: () => {},
                panel: <ReputationCard />,
              },
            }}
          />
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

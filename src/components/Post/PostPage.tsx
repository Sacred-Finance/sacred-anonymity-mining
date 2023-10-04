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
    <div className="h-screen w-full  transition-colors ">
      <div className="grid grid-cols-12 gap-6">
        {/* Post Item */}
        <div className="col-span-12 h-fit rounded-lg bg-white p-6 shadow-md transition-shadow dark:bg-gray-700 md:col-span-6">
          <CommunityCard community={community} isAdmin={false} variant={'banner'} />

          <PostItem post={post} />
          <div className="mb-4 flex justify-between border-b pb-4 dark:border-gray-700">
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
                <span className="font-bold text-gray-800 dark:text-gray-300">{post.upvote}</span>
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
                <span className="font-bold text-gray-800 dark:text-gray-300">{post.downvote}</span>
              </VoteDownButton>
            </div>
            <SummaryButton postData={OutputDataToHTML(post?.description)} postTitle={post.title} />
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="col-span-12 overflow-y-auto rounded-lg bg-white p-6 shadow-md transition-shadow dark:bg-gray-900 md:col-span-6">
          {/* Voting Buttons */}

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

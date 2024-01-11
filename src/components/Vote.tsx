import React, { useEffect, useState } from 'react'
import { useUserIfJoined } from '@/contexts/UseUserIfJoined'
import { useAccount } from 'wagmi'
import { useTranslation } from 'next-i18next'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { utils } from 'ethers'
import { toast } from 'react-toastify'
import { VoteDownButton, VoteUpButton } from '@components/buttons'
import type { Group, Item, VoteKind } from '@/types/contract/ForumInterface'
import { Group as SemaphoreGroup } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import { vote } from '@/lib/api'
import { generateProof } from '@semaphore-protocol/proof'
import { fetchUsersFromSemaphoreContract, hashBytes2 } from '@/lib/utils'
import clsx from 'clsx'

export const VoteUI = ({ post, group }: { post: Item; group: Group }) => {
  const groupId = group?.id?.toString()
  const user = useUserIfJoined(groupId)
  const { t } = useTranslation()
  const { address } = useAccount()
  const { checkUserBalance } = useValidateUserBalance(group, address)

  const [currentVoteType, setCurrentVoteType] = useState<VoteKind | null>(null)

  const [votes, setVotes] = useState<{ upvote: number; downvote: number }>({
    upvote: post.upvote ?? 0,
    downvote: post.downvote ?? 0,
  })

  useEffect(() => {
    setVotes({
      upvote: post.upvote ?? 0,
      downvote: post.downvote ?? 0,
    })
  }, [post.upvote, post.downvote])

  const validateRequirements = () => {
    if (!address) {
      return toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })
    }
    if (!user) {
      return toast.error(t('toast.error.notJoined'), {
        type: 'error',
        toastId: 'min',
      })
    }

    return true
  }

  const voteForPost = async (itemId: number, voteType: 0 | 1) => {
    if (currentVoteType || validateRequirements() !== true) {
      return
    }

    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) {
      return
    }

    setCurrentVoteType(voteType)

    const voteItem = async () => {
      const voteCmdNum = hashBytes2(+itemId, 'vote')
      const signal = utils.hexZeroPad('0x' + voteCmdNum.toString(16), 32)
      const extraNullifier = voteCmdNum.toString()
      const semaphoreGroup = new SemaphoreGroup(BigInt(groupId))
      const users = await fetchUsersFromSemaphoreContract(groupId)
      users.forEach(u => semaphoreGroup.addMember(BigInt(u)))
      const userIdentity = new Identity(address)

      const { proof, nullifierHash, merkleTreeRoot } = await generateProof(
        userIdentity,
        semaphoreGroup,
        extraNullifier,
        signal
      )
      return await vote(
        itemId.toString(),
        groupId,
        voteType,
        merkleTreeRoot.toString(),
        nullifierHash.toString(),
        proof
      )
    }
    try {
      setVotes({
        ...votes,
        [voteType === 0 ? 'upvote' : 'downvote']: votes[voteType === 0 ? 'upvote' : 'downvote'] + 1,
      })
      setCurrentVoteType(voteType)
      const response = await voteItem()
      if (response.status !== 200) {
        toast.error('Failed to vote')
      }
      setCurrentVoteType(null)
      return
    } catch (error) {
      console.log(error)
      toast.error(t('alert.voteFailed'))
      setVotes(v => ({
        ...v,
        [voteType === 0 ? 'upvote' : 'downvote']: v[voteType === 0 ? 'upvote' : 'downvote'] - 1,
      }))
      setCurrentVoteType(null)
    }
  }

  return (
    <>
      <VoteUpButton
        className={clsx(['p-0 text-sm text-white', currentVoteType === 0 && 'animate-pulse'])}
        isConnected={!!address}
        isJoined={!!user}
        onClick={() => voteForPost(Number(post.id), 0)}
        disabled={!address}
      >
        {votes.upvote}
      </VoteUpButton>
      <VoteDownButton
        className={clsx(['p-0 text-sm text-white', currentVoteType === 1 && 'animate-pulse'])}
        isConnected={!!address}
        isJoined={!!user}
        onClick={() => voteForPost(Number(post.id), 1)}
        disabled={!address}
      >
        {votes.downvote}
      </VoteDownButton>
    </>
  )
}

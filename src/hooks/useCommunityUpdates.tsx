import { useEffect, useCallback } from 'react'
import { BigNumber } from 'ethers'
import {
  createNote,
  getContent,
  getIpfsHashFromBytes32,
  hashBytes,
  parsePost,
  removeDuplicates,
  sortArray,
} from '../lib/utils'
import { useSWRConfig } from 'swr'
import { useContract, useProvider } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'
import { ForumContractAddress } from '../constant/const'
import ForumABI from '../constant/abi/Forum.json'

const POST_ITEM_TYPE = 0

export const useCommunityUpdates = ({ hasUserJoined, id, groupCacheId, postInstance }) => {
  const { mutate } = useSWRConfig()
  const provider = useProvider({ chainId: polygonMumbai.id })
  const forumContract = useContract({
    address: ForumContractAddress,
    abi: ForumABI.abi,
    signerOrProvider: provider,
  })

  const updatePosts = useCallback(
    async (p, parsedPost) => {
      mutate(
        groupCacheId,
        async posts => {
          const confirmedPosts = [...posts]
          confirmedPosts.unshift({
            ...parsedPost,
            createdAt: new Date(p.createdAtBlock.toNumber() * 1000),
            // createdAt: new Date(block.timestamp * 1000),
            id: p.id.toString(),
            upvote: p.upvote?.toNumber(),
            downvote: p.downvote?.toNumber(),
          })

          return sortArray(removeDuplicates(confirmedPosts, 'id'), 'createdAt', true)
        },
        { revalidate: false }
      )
    },
    [groupCacheId, mutate]
  )

  const gatherContent = useCallback(
    async (contentCID, postId) => {
      const p = await forumContract.itemAt(postId.toNumber())
      const postIPFShash = getIpfsHashFromBytes32(p?.contentCID)
      const [content, block] = await Promise.all([
        getContent(postIPFShash),
        provider.getBlock(p.createdAtBlock.toNumber()),
      ])

      const parsedPost = parsePost(content)
      await updatePosts(p, parsedPost)
    },
    [forumContract, provider, updatePosts]
  )

  const handleNewItem = useCallback(
    async (itemType, groupId, postId, parentId, contentCID, note) => {
      const signal = contentCID
      const identityCommitment = BigInt(hasUserJoined.identityCommitment.toString())
      const generatedNote = await createNote(hashBytes(signal), identityCommitment)

      if (itemType === POST_ITEM_TYPE && groupId.toString() === id && note.toString() !== generatedNote.toString()) {
        await gatherContent(contentCID, postId)
      }
    },
    [gatherContent, id, hasUserJoined]
  )

  const handleVoteItem = useCallback(
    async (voteType, itemType, itemId, upvote, downvote) => {
      try {
        if (itemType === POST_ITEM_TYPE) {
          postInstance.updatePostsVote(postInstance, itemId, voteType, true)
        }
      } catch (err) {
        console.error('Error in VoteItem event handler:', err)
      }
    },
    [postInstance]
  )

  const listenToEvents = useCallback(() => {
    if (hasUserJoined && provider && forumContract && handleNewItem && handleVoteItem) {
      provider.once('block', () => {
        try {
          forumContract.on('NewItem', handleNewItem)
          forumContract.on('VoteItem', handleVoteItem)
        } catch (error) {
          console.error('Error occurred while listening to contract events:', error)
        }
      })
    }
  }, [hasUserJoined, provider, forumContract, handleNewItem, handleVoteItem])

  useEffect(() => {
    listenToEvents()

    return () => {
      if (forumContract) forumContract.removeAllListeners()

      if (provider) provider.removeAllListeners()
    }
  }, [listenToEvents, forumContract, provider])
}

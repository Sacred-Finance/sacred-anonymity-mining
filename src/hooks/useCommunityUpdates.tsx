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
import { PostInterface } from '../lib/post'
import { User } from '../lib/model'

const POST_ITEM_TYPE = 0
const POLLING_INTERVAL = 60000 // Set to one minute, adjust as necessary

const updatePosts = (groupCacheId, mutate) => async (p, parsedPost) => {
  mutate(
    groupCacheId,
    async posts => {
      const confirmedPosts = Array.isArray(posts) ? [...posts] : []
      confirmedPosts.unshift({
        ...parsedPost,
        createdAt: new Date(p.createdAtBlock.toNumber() * 1000),
        id: p.id.toString(),
        upvote: p.upvote?.toNumber(),
        downvote: p.downvote?.toNumber(),
      })

      return sortArray(removeDuplicates(confirmedPosts, 'id'), 'createdAt', true)
    },
    { revalidate: false }
  )
}
const gatherContent = (postInstance, updatePostsCallback) => async (contentCID, postId) => {
  const p = await postInstance.forumContract.itemAt(postId.toNumber())
  const postIPFShash = getIpfsHashFromBytes32(p?.contentCID)
  const [content, block] = await Promise.all([
    getContent(postIPFShash),
    postInstance.provider.getBlock(p.createdAtBlock.toNumber()),
  ])

  const parsedPost = parsePost(content)
  await updatePostsCallback(p, parsedPost)
}

const handleNewItem =
  (gatherContentCallback, id, hasUserJoined) => async (itemType, groupId, postId, parentId, contentCID, note) => {
    if (isNaN(id)) return
    const signal = contentCID
    const identityCommitment = BigInt(hasUserJoined.identityCommitment.toString())
    const generatedNote = await createNote(hashBytes(signal), identityCommitment)

    if (itemType === POST_ITEM_TYPE && groupId.toString() === id && note.toString() !== generatedNote.toString()) {
      await gatherContentCallback(contentCID, postId)
    }
  }

const handleVoteItem = postInstance => async (voteType, itemType, itemId, upvote, downvote) => {
  if (!postInstance || isNaN(itemId)) return
  try {
    if (itemType === POST_ITEM_TYPE) {
      postInstance.updatePostsVote(postInstance, itemId, voteType, true)
    }
  } catch (err) {
    console.error('Error in VoteItem event handler:', err)
  }
}

const fetchEvents = (hasUserJoined, postInstance, handleNewItemCallback, handleVoteItemCallback) => async () => {
  if (hasUserJoined && postInstance?.provider && postInstance?.forumContract) {
    console.log('fetching community events')

    try {
      const [newItemEvents, voteItemEvents] = await Promise.all([
        postInstance?.forumContract.queryFilter(postInstance?.forumContract.filters.NewItem()),
        postInstance?.forumContract.queryFilter(postInstance?.forumContract.filters.VoteItem()),
      ])

      await Promise.all([
        ...newItemEvents.map(event => (event.args ? handleNewItemCallback(...Object.values(event.args)) : null)),
        ...voteItemEvents.map(event => (event.args ? handleVoteItemCallback(...Object.values(event.args)) : null)),
      ])
    } catch (error) {
      console.error('Error occurred while fetching contract events:', error)
    }
  }
}

export const useCommunityUpdates = ({
  hasUserJoined,
  id,
  groupCacheId,
  postInstance,
}: {
  hasUserJoined: User
  id: PostInterface['groupId']
  groupCacheId: string
  postInstance: PostInterface
}) => {
  const { mutate } = useSWRConfig()

  const updatePostsCallback = useCallback(updatePosts(groupCacheId, mutate), [groupCacheId, mutate])
  const gatherContentCallback = useCallback(gatherContent(postInstance, updatePostsCallback), [
    postInstance,
    updatePostsCallback,
  ])
  const handleNewItemCallback = useCallback(handleNewItem(gatherContentCallback, id, hasUserJoined), [
    gatherContentCallback,
    id,
    hasUserJoined,
  ])
  const handleVoteItemCallback = useCallback(handleVoteItem(postInstance), [postInstance])
  const fetchEventsCallback = useCallback(
    fetchEvents(hasUserJoined, postInstance, handleNewItemCallback, handleVoteItemCallback),
    [hasUserJoined, postInstance, handleNewItemCallback, handleVoteItemCallback]
  )

  useEffect(() => {
    if (!postInstance?.provider || !postInstance?.forumContract) return
    console.log('listening to events')
    fetchEventsCallback()
    const intervalId = setInterval(fetchEventsCallback, POLLING_INTERVAL)

    return () => {
      clearInterval(intervalId)
      if (postInstance?.forumContract) postInstance?.forumContract.removeAllListeners()
      if (postInstance?.provider) postInstance?.provider.removeAllListeners()
    }
  }, [fetchEventsCallback, postInstance?.forumContract, postInstance?.provider])
}

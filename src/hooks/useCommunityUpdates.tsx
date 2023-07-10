import { useEffect, useCallback, useRef } from 'react'
import { getContent, getIpfsHashFromBytes32, parsePost, removeDuplicates, sortArray } from '../lib/utils'
import { useSWRConfig } from 'swr'
import { User } from '../lib/model'
import { forumContract, jsonRPCProvider } from '../constant/const'
import { Post } from '@/lib/post'

export const handleError = message => {
  throw new Error(message)
}

const POST_ITEM_TYPE = 0
const updatePosts = (groupCacheId, mutate) => async (p, parsedPost) => {
  if (!groupCacheId) handleError('groupCacheId is not defined')
  if (!parsedPost) handleError('parsedPost is not defined')
  if (!p) handleError('p is not defined')

  return mutate(
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
const gatherContent = updatePostsCallback => async (contentCID, postId) => {
  const p = await forumContract.itemAt(postId.toNumber())
  const postIPFShash = getIpfsHashFromBytes32(p?.contentCID)
  const content = await getContent(postIPFShash)

  const parsedPost = parsePost(content)
  return await updatePostsCallback(p, parsedPost)
}

const handleNewItem = (gatherContentCallback, id) => async (itemType, groupId, postId, parentId, contentCID) => {
  if (isNaN(id)) return

  if (itemType === POST_ITEM_TYPE && groupId.toString() === id) {
    await gatherContentCallback(contentCID, postId)
  }
}

const handleVoteItem = postInstance => async (voteType, itemType, itemId, upvote, downvote) => {
  if (!postInstance) handleError('postInstance is not defined')
  if (isNaN(itemId)) return
  try {
    if (itemType === POST_ITEM_TYPE) {
      postInstance.updatePostsVote(postInstance, itemId, voteType, true)
    }
  } catch (err) {
    console.error('Error in VoteItem event handler:', err)
  }
}

const fetchEvents = async (postInstance, handleNewItemCallback, handleVoteItemCallback) => {
  if (!jsonRPCProvider || !forumContract) {
    handleError('jsonRPCProvider or forumContract is not defined')
  }


  try {
    const newItemEvents = await forumContract.queryFilter(forumContract.filters.NewItem())
    const voteItemEvents = await forumContract.queryFilter(forumContract.filters.VoteItem())

    const newItemPromises = newItemEvents.map(event => {
      if (event.args) {
        return handleNewItemCallback(event.args)
      }
    })

    const voteItemPromises = voteItemEvents.map(event => {
      if (event.args) {
        return handleVoteItemCallback(event.args)
      }
    })

    await Promise.all([...newItemPromises, ...voteItemPromises])
  } catch (error) {
    console.error('Error occurred while fetching contract events:', error)
  }
}

export const useCommunityUpdates = ({ postInstance }: { postInstance: Post }) => {
  const groupId = postInstance.groupId
  const groupCacheId = `${groupId}_group`
  const { mutate } = useSWRConfig()

  const updatePostsCB = useCallback(updatePosts(groupCacheId, mutate), [groupCacheId, mutate])
  const getContentCB = useCallback(gatherContent(updatePostsCB), [updatePostsCB])
  const handleNewItemCB = useCallback(handleNewItem(getContentCB, groupId), [getContentCB, groupId])
  const handleVoteItemCB = useCallback(handleVoteItem(postInstance), [postInstance])

  const fetchEventsCallback = useCallback(() => {
    if (!postInstance) handleError('postInstance is not defined')
    if (!handleNewItemCB) handleError('handleNewItemCB is not defined')
    if (!handleVoteItemCB) handleError('handleNewItemCB or handleVoteItemCB is not defined')
    fetchEvents(postInstance, handleNewItemCB, handleVoteItemCB)
  }, [postInstance, handleNewItemCB, handleVoteItemCB])

  const didLoadRef = useRef(false)
  useEffect(() => {
    if (didLoadRef.current) return
    if (!jsonRPCProvider || !forumContract) handleError('jsonRPCProvider or forumContract is not defined')
    didLoadRef.current = true
    fetchEventsCallback()

    return () => {
      if (forumContract) forumContract.removeAllListeners()
      if (jsonRPCProvider) jsonRPCProvider.removeAllListeners()
    }
  }, [fetchEventsCallback])
}

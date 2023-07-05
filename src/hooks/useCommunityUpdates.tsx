import { useEffect, useCallback } from 'react'
import { createNote, getContent, getIpfsHashFromBytes32, parsePost, removeDuplicates, sortArray } from '../lib/utils'
import { useSWRConfig } from 'swr'
import { User } from '../lib/model'
import { forumContract, jsonRPCProvider } from '../constant/const'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'

const POST_ITEM_TYPE = 0
const POLLING_INTERVAL = 60000
const updatePosts = (groupCacheId, mutate) => async (p, parsedPost) => {
  // groupCacheId is the cache key for the group posts
  // it can be undefined on the first load
  if (!groupCacheId) return console.error('groupCacheId is not defined')

  if (!parsedPost) return console.error('parsedPost is not defined')
  if (!p) return console.error('p is not defined')

  return await mutate(
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
  const [content, block] = await Promise.all([
    getContent(postIPFShash),
    jsonRPCProvider.getBlock(p.createdAtBlock.toNumber()),
  ])

  const parsedPost = parsePost(content)
  return await updatePostsCallback(p, parsedPost)
}

const handleNewItem =
  (gatherContentCallback, id, user) => async (itemType, groupId, postId, parentId, contentCID, note) => {
    if (isNaN(id)) return

    if (itemType === POST_ITEM_TYPE && groupId.toString() === id) {
      await gatherContentCallback(contentCID, postId)
    }
  }

const handleVoteItem = postInstance => async (voteType, itemType, itemId, upvote, downvote) => {
  if (!postInstance) throw new Error('postInstance is not defined')
  if (isNaN(itemId)) return
  try {
    if (itemType === POST_ITEM_TYPE) {
      postInstance.updatePostsVote(postInstance, itemId, voteType, true)
    }
  } catch (err) {
    console.error('Error in VoteItem event handler:', err)
  }
}

const fetchEvents = (user, postInstance, handleNewItemCallback, handleVoteItemCallback) => async () => {
  if (!jsonRPCProvider || !forumContract) throw new Error('jsonRPCProvider or forumContract is not defined')
  if (user) {
    try {
      const [newItemEvents, voteItemEvents] = await Promise.all([
        forumContract.queryFilter(forumContract.filters.NewItem()),
        forumContract.queryFilter(forumContract.filters.VoteItem()),
      ])

      return await Promise.all([
        ...newItemEvents.map(event => (event.args ? handleNewItemCallback(...Object.values(event.args)) : null)),
        ...voteItemEvents.map(event => (event.args ? handleVoteItemCallback(...Object.values(event.args)) : null)),
      ])
    } catch (error) {
      console.error('Error occurred while fetching contract events:', error)
    }
  } else {
    console.log('user is not defined in fetchEvents')
  }
}

export const useCommunityUpdates = ({
  user,
  postInstance,
}: {
  user: User | false
  postInstance: any // replace any with the appropriate type if possible
}) => {
  const router = useRouter()
  const { groupId } = router.query
  const groupCacheId = `${groupId}_group`
  const { mutate } = useSWRConfig()

  const updatePostsCallback = useCallback(updatePosts(groupCacheId, mutate), [groupCacheId, mutate])
  const gatherContentCallback = useCallback(gatherContent(updatePostsCallback), [updatePostsCallback])
  const handleNewItemCallback = useCallback(
    handleNewItem(gatherContentCallback, groupId, user !== false ? user : undefined),
    [gatherContentCallback, groupId, user]
  )
  const handleVoteItemCallback = useCallback(handleVoteItem(postInstance), [postInstance])

  const fetchEventsCallback = useCallback(
    fetchEvents(user !== false ? user : undefined, postInstance, handleNewItemCallback, handleVoteItemCallback),
    [user, postInstance, handleNewItemCallback, handleVoteItemCallback]
  )

  useEffect(() => {
    if (!jsonRPCProvider || !forumContract) throw new Error('jsonRPCProvider or forumContract is not defined')
    if (!router.isReady) return
    console.trace('useCommunityUpdates') // todo: investigate - this is being fired three times

    fetchEventsCallback()
    const intervalId = setInterval(async () => {
      fetchEventsCallback()
    }, POLLING_INTERVAL)

    return () => {
      clearInterval(intervalId)
      if (forumContract) forumContract.removeAllListeners()
      if (jsonRPCProvider) jsonRPCProvider.removeAllListeners()
    }
  }, [fetchEventsCallback, router.isReady])
}

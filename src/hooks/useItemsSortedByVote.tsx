import { useMemo } from 'react'
import type { Item } from '@/types/contract/ForumInterface'

const sortByVoteDifference =
  (inverse = false) =>
  (a, b) => {
    const voteDiff = item => item.upvote - item.downvote
    return inverse ? voteDiff(a) - voteDiff(b) : voteDiff(b) - voteDiff(a)
  }

const sortByControversial = (a, b) => {
  const totalVotes = item => item.upvote + item.downvote
  const controversyRatio = item => {
    const votes = totalVotes(item)
    return votes > 0 ? Math.abs(item.upvote - item.downvote) / votes : 1
  }
  const aRatio = controversyRatio(a)
  const bRatio = controversyRatio(b)
  const votesComparison = totalVotes(b) - totalVotes(a)
  return votesComparison === 0 ? aRatio - bRatio : votesComparison
}

const sortByDate =
  (inverse = false) =>
  (a, b) => {
    const dateDiff = item => new Date(item?.description?.time).getTime()
    return inverse ? dateDiff(a) - dateDiff(b) : dateDiff(b) - dateDiff(a)
  }

const sortByActivity = (a, b) => b.childIds.length - a.childIds.length

const sortByContentLength = (a, b) => b.note.length - a.note.length

const sortByEngagementScore = (a, b) => {
  const engagementScore = item => item.upvote + item.childIds.length - item.downvote
  return engagementScore(b) - engagementScore(a)
}

export const useItemsSortedByVote = (
  tempData: Item[],
  data: Item[],
  sortBy: 'highest' | 'lowest' | 'controversial' | 'newest' | 'oldest' | 'activity' | 'contentLength' | 'engagement'
): Item[] => {
  return useMemo(() => {
    if (!data) {
      return []
    }
    const sorted = [...tempData, ...data].filter(item => item !== undefined && item !== null)

    switch (sortBy) {
      case 'highest':
        return sorted.sort(sortByVoteDifference())
      case 'lowest':
        return sorted.sort(sortByVoteDifference(true))
      case 'controversial':
        return sorted.sort(sortByControversial)
      case 'newest':
        return sorted.sort(sortByDate())
      case 'oldest':
        return sorted.sort(sortByDate(true))
      case 'activity':
        return sorted.sort(sortByActivity)
      case 'contentLength':
        return sorted.sort(sortByContentLength)
      case 'engagement':
        return sorted.sort(sortByEngagementScore)
      default:
        return sorted
    }
  }, [tempData, data, sortBy])
}

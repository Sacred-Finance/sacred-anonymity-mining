import { useMemo } from 'react'
import type { Item } from '@/types/contract/ForumInterface'

export const useItemsSortedByVote = (
  tempData: Item[],
  data: Item[],
  sortBy: 'highest' | 'lowest' | 'controversial' | 'newest' | 'oldest'
) => {
  return useMemo(() => {
    const sorted = [
      ...tempData.filter(data => data),
      ...(data?.filter(data => data) ?? []),
    ]

    switch (sortBy) {
      case 'highest':
        return sorted.sort(
          (a, b) => b.upvote - b.downvote - (a.upvote - a.downvote)
        )
      case 'lowest':
        return sorted.sort(
          (a, b) => a.upvote - a.downvote - (b.upvote - b.downvote)
        )
      case 'controversial':
        return sorted.sort((a, b) => {
          const aVotes = a.upvote + a.downvote
          const bVotes = b.upvote + b.downvote
          const aDiff = Math.abs(a.upvote - a.downvote)
          const bDiff = Math.abs(b.upvote - b.downvote)
          const aRatio = aVotes > 0 ? aDiff / aVotes : 1
          const bRatio = bVotes > 0 ? bDiff / bVotes : 1
          if (aVotes === bVotes) {
            return aRatio - bRatio
          } else {
            return bVotes - aVotes
          }
        })
      case 'newest':
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case 'oldest':
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      default:
        return sorted
    }
  }, [tempData, data, sortBy])
}

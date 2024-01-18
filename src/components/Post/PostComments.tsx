import React from 'react'
import type { Group, Item } from '@/types/contract/ForumInterface'
import { PostItem } from '@components/Post/PostItem'
import { useCommunityContext } from '@/contexts/CommunityProvider'

export const PostComment = ({
  comment,
}: {
  comment: Item & { time?: Date } // where is time added!?
}) => {
  const { state } = useCommunityContext()
  const community = state?.activeCommunity?.community as Group
  return <>{comment && <PostItem post={comment} group={community} />}</>
}

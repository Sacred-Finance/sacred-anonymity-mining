import React, { useCallback, useRef, useState } from 'react'
import { PostItem } from '@components/Post/PostItem'
import { ContentType } from '@/lib/model'
import { Item } from '@/types/contract/ForumInterface'
import { PostNavigator } from '@components/CommunityPage'
import { motion } from 'framer-motion'
import { NoPosts } from '@components/Post/NoPosts'
import { CircularLoader } from '@components/JoinCommunityButton'

const MemoizedPostItem = React.memo(PostItem)

export const PostList = ({ posts }: { posts: Item[] }) => {
  if (!posts) return null




  const renderedPosts = posts.map(p => {
    if (ContentType[p?.kind] === undefined) {
      return null
    }

    return (
      <motion.div
        key={p.id}
        className={''}
      >
        <MemoizedPostItem post={p} />
      </motion.div>
    )
  })

  return (
    <div className="flex flex-wrap gap-2">
      {renderedPosts?.length === 0 && <NoPosts />}
      {renderedPosts === undefined ? <CircularLoader /> : <>{renderedPosts}</>}
    </div>
  )
}

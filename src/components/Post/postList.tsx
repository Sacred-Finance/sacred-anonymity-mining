import React, { useState, useRef, useCallback } from 'react'
import { PostItem } from '@components/Post/postItem'
import { ContentType } from '@/lib/model'
import { Item } from '@/types/contract/ForumInterface'
import Link from 'next/link'
import { PrimaryButton } from '@components/buttons'
import { PostNavigator } from '@components/CommunityPage'
import { motion } from 'framer-motion'
import { NoPosts } from '@components/Post/NoPosts'
import { CircularLoader } from '@components/JoinCommunityButton'

const MemoizedPostItem = React.memo(PostItem)

export const PostList = ({ posts }: { posts: Item[] }) => {
  if (!posts) return null

  const [visibleIds, setVisibleIds] = useState(new Set<Item['id']>())
  const refs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const handleViewportEnter = (id: Item['id']) => {
    setVisibleIds(prev => new Set(prev).add(id))
  }

  const handleViewportLeave = (id: Item['id']) => {
    setVisibleIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const scrollIntoView = useCallback((id: string) => {
    const ref = refs.current[id]
    if (ref) {
      ref.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [])

  const renderedPosts = posts.map(p => {
    if (ContentType[p?.kind] === undefined) {
      return null
    }

    return (
      <motion.div
        ref={el => (refs.current[p.id] = el)}
        onViewportEnter={() => handleViewportEnter(p.id)}
        onViewportLeave={() => handleViewportLeave(p.id)}
        key={p.id}
        className="relative flex min-w-[300px] max-w-[500px] flex-none flex-col rounded border border-gray-400 p-3
        shadow-lg   transition-all duration-300 ease-in-out sm:w-full sm:flex-grow md:w-auto

        "
      >
        <MemoizedPostItem post={p} />

        <div className="flex-grow" />
        <Link href={`/communities/${p.groupId}/post/${p.id}`} className={' w-fit self-end rounded'}>
          <PrimaryButton >
            Visit Post <span className={'text-2xl'}> &rarr;</span>
          </PrimaryButton>
        </Link>
      </motion.div>
    )
  })

  return (
    <div className="flex gap-6 py-6">
      <div className={'w-3/4'}>
        {renderedPosts === undefined ? (
          <CircularLoader />
        ) : (
          <>
            {renderedPosts}
            {renderedPosts?.length === 0 && <NoPosts />}
          </>
        )}
      </div>
      {renderedPosts.length !== 0 && (
        <PostNavigator posts={posts} visiblePostIds={Array.from(visibleIds)} scrollIntoView={scrollIntoView} />
      )}
    </div>
  )
}

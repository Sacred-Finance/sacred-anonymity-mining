import React from 'react'
import { PostItem } from '@components/Post/postItem'
import { ContentType } from '@/lib/model'
import { Item } from '@/types/contract/ForumInterface'
import Link from 'next/link'
import { PrimaryButton } from '@components/buttons'
import { PostNavigator } from '@components/CommunityPage'
import { motion } from 'framer-motion'

const MemoizedPostItem = React.memo(PostItem)

export const PostList = ({ posts }: { posts: Item[] }) => {
  const [visibleIds, setVisibleIds] = React.useState(new Set<Item['id']>())

  // On entering the viewport
  const onViewportEnter = (id: Item['id']) => {
    setVisibleIds(prev => new Set(prev).add(id))
  }

  // On leaving the viewport
  const onViewportLeave = (id: Item['id']) => {
    setVisibleIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }
  const refs = React.useRef<{ [key: string]: HTMLDivElement | null }>({})

  const scrollIntoView = React.useCallback((id: string) => {
    const ref = refs.current[id]
    if (ref) {
      ref.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [])

  if (!posts) return null
  return (
    <div className="grid grid-cols-12 ">
      <div className="col-span-10 flex flex-col gap-2">
        <div className="flex flex-grow flex-wrap justify-stretch gap-2 p-3 ">
          {posts.map(p => {
            if (ContentType[p?.kind] === undefined) {
              return null // or <></>
            }

            return (
              <motion.div
                ref={el => (refs.current[p.id] = el)}
                onViewportEnter={onViewportEnter}
                onViewportLeave={onViewportLeave}
                key={p.id}
                className={
                  'relative flex  flex-col rounded border border-gray-400 p-3  hover:brightness-110 sm:flex-grow '
                }
              >
                <MemoizedPostItem post={p} />

                <div className={'flex-grow'} />
                <Link href={`/communities/${p.groupId}/post/${p.id}`}>
                  <PrimaryButton className="float-right text-xs underline underline-offset-4 hover:text-primary-600">
                    Visit Page
                  </PrimaryButton>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
      <div className={'col-span-2  p-1'}>
        <PostNavigator posts={posts} visiblePostIds={Array.from(visibleIds)} scrollIntoView={scrollIntoView} />
      </div>
    </div>
  )
}

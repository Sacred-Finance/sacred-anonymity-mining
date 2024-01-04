import React from 'react'
import { ContentType } from '@/lib/model'
import type { Group, Item } from '@/types/contract/ForumInterface'
import { NoPosts } from '@components/Post/NoPosts'
import { CircularLoader } from '@components/buttons/JoinCommunityButton'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import { PostTitle } from '@components/Post/PostTitle'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shad/ui/card'
import { Badge } from '@/shad/ui/badge'
import { ScrollArea, ScrollBar } from '@/shad/ui/scroll-area'
import AnimalAvatar from '../AnimalAvatar'
import clsx from 'clsx'
import { VoteUI } from '../Vote'

export const PostList = ({ posts, group, refreshData }: { posts: Item[]; group: Group; refreshData?: () => void }) => {
  if (!posts) {
    return null
  }

  const renderedPosts = posts.map(p => {
    if (ContentType[p?.kind] === undefined) {
      return null
    }

    return (
      <Card
        key={p.id}
        id={p?.isMutating ? `new_post` : `post_${p.id}`}
        className={clsx([
          'group relative flex flex-col justify-between divide-y divide-gray-300/20 overflow-hidden rounded-lg  bg-gray-300/20 dark:divide-gray-800/50 dark:bg-gray-800/50',
          p?.isMutating ? 'animate-pulse' : '',
        ])}
      >
        <CardHeader className="relative z-10   flex w-full flex-col px-3  py-1">
          <CardTitle className="flex w-full items-center justify-between gap-4">
            <PostTitle post={p} title={p.title} onPostPage={false} id="" />
            <span className="flex basis-1/4 gap-2">
              <VoteUI post={p} group={group} />
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className=" overflow-hidden px-3 py-6">
          <EditorJsRenderer data={p.description} className="line-clamp-4" />
        </CardContent>
        <CardFooter className="relative z-30 flex justify-between gap-1  bg-black/10 p-2">
          <AnimalAvatar seed={`${p.note}_${Number(p.groupId)}`} options={{ size: 30 }} />

          <Badge className="flex gap-4 text-xs">
            {p.childIds.length} {p.childIds.length === 1 ? 'Reply' : 'Replies'}
          </Badge>
        </CardFooter>
      </Card>
    )
  })

  return (
    <div className="flex flex-wrap gap-2">
      {renderedPosts?.length === 0 && <NoPosts />}

      <ScrollArea className="h-full">
        <div className="grid-cols-auto flex grow flex-col  gap-6 rounded-lg p-0 md:grid  md:py-8 lg:grid-cols-2 xl:grid-cols-3">
          {renderedPosts === undefined ? <CircularLoader /> : <>{renderedPosts}</>}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  )
}

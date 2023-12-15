import React from 'react'
import { ContentType } from '@/lib/model'
import type { Item } from '@/types/contract/ForumInterface'
import { NoPosts } from '@components/Post/NoPosts'
import { CircularLoader } from '@components/buttons/JoinCommunityButton'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import { PostTitle } from '@components/Post/PostTitle'
import { Card, CardContent, CardHeader } from '@/shad/ui/card'
import { Badge } from '@/shad/ui/badge'
import { ScrollArea, ScrollBar } from '@/shad/ui/scroll-area'
import AnimalAvatar from '../AnimalAvatar'

export const PostList = ({ posts }: { posts: Item[] }) => {
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
        className={'flex w-96 shrink flex-col justify-between overflow-visible'}
      >
        <CardHeader className={'flex items-center flex-row justify-between'}>
          <PostTitle post={p} title={p.title} onPostPage={false} id={''} />
          <div
            className={'flex basis-1/2 items-center gap-4 justify-end w-full'}
          >
            <AnimalAvatar
              seed={`${p.note}_${Number(p.groupId)}`}
              options={{ size: 30 }}
            />

            <Badge className="flex gap-4">{p.childIds.length} Posts</Badge>
          </div>
        </CardHeader>

        <CardContent className={' overflow-hidden'}>
          <EditorJsRenderer data={p.description} className={'line-clamp-4'} />
        </CardContent>
      </Card>
    )
  })

  return (
    <div className="flex flex-wrap gap-2">
      {renderedPosts?.length === 0 && <NoPosts />}

      <ScrollArea className={'h-full'}>
        <div className=" items-stretch justify-center gap-6 rounded-lg  md:grid lg:grid-cols-2 xl:grid-cols-3">
          {renderedPosts === undefined ? (
            <CircularLoader />
          ) : (
            <>{renderedPosts}</>
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  )
}

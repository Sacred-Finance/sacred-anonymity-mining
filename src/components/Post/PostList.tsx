import React from 'react'
import { ContentType } from '@/lib/model'
import { Item } from '@/types/contract/ForumInterface'
import { NoPosts } from '@components/Post/NoPosts'
import { CircularLoader } from '@components/buttons/JoinCommunityButton'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import { PostTitle } from '@components/Post/PostTitle'
import { BookOpenIcon } from '@heroicons/react/20/solid'
import { Card, CardContent, CardFooter, CardHeader } from '@/shad/ui/card'
import { Badge } from '@/shad/ui/badge'
import { ScrollArea, ScrollBar } from '@/shad/ui/scroll-area'

export const PostList = ({ posts }: { posts: Item[] }) => {
  if (!posts) return null

  const renderedPosts = posts.map(p => {
    if (ContentType[p?.kind] === undefined) {
      return null
    }

    return (
      <Card key={p.id}>
        <CardHeader>
          <PostTitle post={p} title={p.title} onPostPage={false} id={''} />
        </CardHeader>

        <CardContent className={'line-clamp-4  h-32'}>
          <EditorJsRenderer data={p.description} />
        </CardContent>

        <CardFooter className={'flex items-center'}>
          <Badge className="flex gap-4">
            {p.childIds.length} <BookOpenIcon className="h-full w-4" />
          </Badge>
        </CardFooter>
      </Card>
    )
  })

  return (
    <div className="flex flex-wrap gap-2">
      {renderedPosts?.length === 0 && <NoPosts />}

      <ScrollArea className={'h-full h-screen'}>
        <div className="hidden items-start justify-center gap-6 rounded-lg p-8 md:grid lg:grid-cols-2 xl:grid-cols-3">
          {renderedPosts === undefined ? <CircularLoader /> : <>{renderedPosts}</>}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  )
}

import React from 'react'
import { ContentType } from '@/lib/model'
import { Item } from '@/types/contract/ForumInterface'
import { NoPosts } from '@components/Post/NoPosts'
import { CircularLoader } from '@components/JoinCommunityButton'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import { PostTitle } from '@components/Post/PostTitle'

export const PostList = ({ posts }: { posts: Item[] }) => {
  if (!posts) return null

  const renderedPosts = posts.map(p => {
    if (ContentType[p?.kind] === undefined) {
      return null
    }

    return (
      <div className="flex min-w-[300px] flex-wrap  flex-col space-y-4  !max-w-md  rounded-lg bg-white p-2 shadow-md transition-colors dark:bg-gray-900">
        <PostTitle post={p} title={p.title} onPostPage={false} id={''} />
        <EditorJsRenderer data={p.description} className={'line-clamp-3 !prose-sm flex-grow rounded  px-2 dark:bg-gray-800/50'} />
      </div>
    )
  })

  return (
    <div className="flex flex-wrap gap-2">
      {renderedPosts?.length === 0 && <NoPosts />}
      {renderedPosts === undefined ? <CircularLoader /> : <>{renderedPosts}</>}
    </div>
  )
}

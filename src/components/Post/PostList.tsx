import React from 'react'
import { ContentType } from '@/lib/model'
import { Item } from '@/types/contract/ForumInterface'
import { NoPosts } from '@components/Post/NoPosts'
import { CircularLoader } from '@components/JoinCommunityButton'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import { PostTitle } from '@components/Post/PostTitle'
import { BookOpenIcon, UserIcon } from '@heroicons/react/20/solid'

export const PostList = ({ posts }: { posts: Item[] }) => {
  if (!posts) return null

  const renderedPosts = posts.map(p => {
    if (ContentType[p?.kind] === undefined) {
      return null
    }

    return (
      <div key={p.id} className="flex min-w-[300px]  !max-w-md  flex-col flex-wrap  space-y-4  rounded-lg bg-white p-2 shadow-md transition-colors dark:bg-gray-900">
        <PostTitle post={p} title={p.title} onPostPage={false} id={''} />
        <EditorJsRenderer
          data={p.description}
          className={'!prose-sm line-clamp-4 flex-grow rounded  px-2 dark:bg-gray-800/50'}
        />
        <div className="flex items-center gap-4 space-x-2 rounded">
          <p
            className="flex items-center gap-1 rounded bg-gray-200 p-1 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            title={'Responses'}
          >
            {p.childIds.length} <BookOpenIcon className="h-full w-4" />
          </p>



        </div>
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

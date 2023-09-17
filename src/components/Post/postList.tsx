import React, { useEffect } from 'react'
import SortBy from '../SortBy'
import { useAccount } from 'wagmi'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import { PostItem } from '@components/Post/postItem'
import { ContentType } from '@/lib/model'

export const PostList = ({ posts }) => {



  if (!posts) return null
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-grow flex-wrap gap-2 p-3">
        {posts.map(
          p =>
            ContentType[p?.kind] !== undefined && (
              <div key={p.id} className={'rounded border  hover:ring-2 hover:brightness-110 '}>
                <PostItem post={p}/>
              </div>
            )
        )}
      </div>
    </div>
  )
}

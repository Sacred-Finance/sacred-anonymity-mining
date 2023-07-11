import { useRouter } from 'next/router'
import React, { useEffect, useRef } from 'react'
import { Post } from '@/lib/post'
import { useMounted } from '@/hooks/useMounted'
import { PostPage } from '@components/PostPage'
import { CommunityPage } from '@components/CommunityPage'
import WithStandardLayout from "@components/HOC/WithStandardLayout";

function PostIndex() {
  const router = useRouter()
  const { groupId, postId } = router.query
  const postInstance = useRef<Post>(null)
  const isMounted = useMounted()

  useEffect(() => {
    if (!router.isReady) return
    if (isNaN(groupId as number) || isNaN(postId as number)) return
    postInstance.current = new Post(postId as string, groupId)
  }, [groupId, postId, router.isReady])

  if (isNaN(groupId) || isNaN(postId) || !router.isReady || !postInstance.current || !isMounted) return null

  return (
    <CommunityPage postId={postId as string} groupId={groupId as string} postInstance={postInstance.current as Post}>
      <PostPage postId={postId} groupId={groupId as string} postInstance={postInstance.current as Post} />
    </CommunityPage>
  )
}

export default WithStandardLayout(PostIndex)

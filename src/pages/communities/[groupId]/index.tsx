import React, { useEffect, useRef } from 'react'
import { Post } from '@/lib/post'
import { useRouter } from 'next/router'
import LoadingPage from '@components/LoadingComponent'
import { useMounted } from '@/hooks/useMounted'
import { CommunityPage } from '@components/CommunityPage'
import WithStandardLayout from "@components/HOC/WithStandardLayout";

function Group() {
  const router = useRouter()
  const { groupId, postId } = router.query
  const postInstance = useRef<Post>(null)
  const isMounted = useMounted()

  useEffect(() => {
    if (router.isReady && groupId) {
      postInstance.current = new Post(undefined, groupId as string)
    }
  }, [groupId, router?.isReady, postId])

  if (isNaN(groupId) || !router.isReady || !postInstance.current || !isMounted) return <LoadingPage />

  return <CommunityPage groupId={groupId as string} postId={undefined} postInstance={postInstance.current as Post} />
}

export default WithStandardLayout(Group)

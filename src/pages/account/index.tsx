import { CommunityCard } from '@/components/CommunityCard/CommunityCard'
import { PostItem } from '@/components/Post/PostItem'
import { PostList } from '@/components/Post/PostList'
import { useCommunitiesCreatedByUser, useCommunityContext } from '@/contexts/CommunityProvider'
import { useFetchItemsCreatedByUser } from '@/hooks/useFetchItemsCreatedByUser'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shad/ui/tabs'
import { BigNumber } from 'ethers'
import React, { useEffect } from 'react'
import useSWR from 'swr'

const Account = () => {
  const { dispatch } = useCommunityContext()
  const { data, error, isLoading } = useSWR('/api/data')

  useEffect(() => {
    if (!data) return
    const { communitiesData } = data

    if (!communitiesData) return
    dispatch({ type: 'SET_COMMUNITIES', payload: communitiesData.map(c => ({ ...c, id: BigNumber.from(c.id) })) })
  }, [data])
  const { communitiesJoined } = useCommunitiesCreatedByUser()
  const { polls, posts, comments } = useFetchItemsCreatedByUser()

  return (
    <Tabs defaultValue="communities" className="h-full space-y-6">
      <div className="space-between flex flex-wrap items-center gap-2">
        <TabsList>
          <TabsTrigger value="communities" className="relative">
            Communities
          </TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="polls">Polls</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="communities" className="border-none p-0 outline-none">
        <div className="grid-cols-auto flex grow flex-col items-stretch justify-center gap-6 rounded-lg p-0 md:grid md:items-start md:p-8 lg:grid-cols-2 xl:grid-cols-3">
          {communitiesJoined.map(community => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      </TabsContent>
      <TabsContent value="posts" className="border-none p-0 outline-none">
        {posts?.map(post => (
          <div key={post.id} className="mb-3 flex flex-col rounded-xl border p-3 dark:border-gray-700 dark:bg-gray-900">
            <PostItem group={{ id: post?.groupId }} post={post} />
          </div>
        ))}{' '}
      </TabsContent>
      <TabsContent value="polls" className="border-none p-0 outline-none">
        {polls?.map(poll => (
          <div key={poll.id} className="mb-3 flex flex-col rounded-xl border p-3 dark:border-gray-700 dark:bg-gray-900">
            <PostItem group={{ id: poll?.groupId }} post={poll} />
          </div>
        ))}
      </TabsContent>
      <TabsContent value="comments" className="border-none p-0 outline-none">
        {comments?.map(comment => (
          <div key={comment.id} className="mb-3 flex flex-col rounded-xl border p-3 dark:border-gray-700 dark:bg-gray-900">
            <PostItem group={{ id: comment?.groupId }} post={comment} />
          </div>
        ))}
      </TabsContent>
    </Tabs>
  )
}

export default Account

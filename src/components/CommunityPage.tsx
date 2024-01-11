import React, { useState } from 'react'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import type { SortByOption } from '@components/SortBy'
import SortBy from '@components/SortBy'
import { useItemsSortedByVote } from '@/hooks/useItemsSortedByVote'
import { PostList } from '@components/Post/PostList'
import type { Group, Item } from '@/types/contract/ForumInterface'
import LoadingComponent from '@components/LoadingComponent'
import { CommunityCard } from './CommunityCard/CommunityCard'
import PollCreateForm from '@components/form/poll/poll.createForm'
import PostCreateForm from '@components/form/post/post.createForm'
import { ShowConnectIfNotConnected } from '@components/Connect/ConnectWallet'
import { DrawerDialog } from '@components/DrawerDialog'
import { ChatIcon, PollIcon } from '@components/CommunityActionTabs'

export function CommunityPage({ community, posts, mutate }: { community: Group; posts?: Item[]; mutate?: () => void }) {
  const [sortBy, setSortBy] = useState<SortByOption>('highest')
  const sortedData = useItemsSortedByVote([], posts, sortBy)
  const {
    state: { isAdmin },
  } = useCommunityContext()

  if (!community) {
    return <LoadingComponent />
  }

  return (
    <div>
      <div className="relative flex min-h-screen gap-6 rounded-lg p-4 transition-colors ">
        <div className="sticky top-0 flex w-full flex-col gap-6">
          <CommunityCard variant="banner" community={community} isAdmin={isAdmin} />
          <div className="flex w-fit gap-4 rounded-lg ">
            <ShowConnectIfNotConnected>
              <DrawerDialog
                label={
                  <div className="flex items-center gap-2">
                    <ChatIcon className="h-5 w-5" />
                    <span className="text-sm">New Post</span>
                  </div>
                }
              >
                <PostCreateForm group={community} post={undefined} mutate={mutate} />
              </DrawerDialog>
              <DrawerDialog
                label={
                  <div className="flex items-center gap-2">
                    <PollIcon className="h-5 w-5" />
                    <span className="text-sm">New Poll</span>
                  </div>
                }
              >
                <PollCreateForm group={community} post={undefined} mutate={mutate} />
              </DrawerDialog>
            </ShowConnectIfNotConnected>
          </div>
          <SortBy onSortChange={setSortBy} />
          <PostList posts={sortedData} group={community} mutate={mutate} />
        </div>
      </div>
    </div>
  )
}

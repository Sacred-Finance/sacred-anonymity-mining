import { useCommunityContext } from '@/contexts/CommunityProvider'
import React, { useContext, useEffect, useState } from 'react'
import { CommunityCard } from '@components/CommunityCard/CommunityCard'
import { OutputDataToHTML } from '@components/Discourse/OutputDataToMarkDown'
import { PostItem } from '@components/Post/PostItem'
import { PostComment } from '@components/Post/PostComments'
import { Tab } from '@headlessui/react'
import { SparklesIcon } from '@heroicons/react/20/solid'
import { ChatIcon, InfoIcon, PollIcon } from '@components/CommunityActionTabs'
import type { Group, Item } from '@/types/contract/ForumInterface'
import { ContentType } from '@/lib/model'
import { ScrollArea } from '@/shad/ui/scroll-area'
import AIDigestButton from '@components/buttons/AIPostDigestButton'
import { Card } from '@/shad/ui/card'
import { DynamicAccordion } from '@components/Post/DynamicAccordion'
import { analysisLabelsAndTypes } from '@components/Post/AiAccordionConfig'
import { AnalysisCheckboxComponent } from '@components/Post/AiAnalysisCheckboxComponent'
import { buttonVariants } from '@/shad/ui/button'
import { ShowConnectIfNotConnected } from '@components/Connect/ConnectWallet'
import { DrawerDialog } from '@components/DrawerDialog'
import type { MutateType } from '@components/form/post/post.createForm'
import PostCreateForm from '@components/form/post/post.createForm'
import PollCreateForm from '@components/form/poll/poll.createForm'
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/16/solid'

export const AIDigestContext = React.createContext<{
  enabled: { [key: string]: boolean }
  setEnabled: { [key: string]: React.Dispatch<React.SetStateAction<boolean>> }
  responses: { [key: string]: string }
  setResponses: { [key: string]: React.Dispatch<React.SetStateAction<string>> }
}>({
  enabled: {},
  setEnabled: {},
  responses: {},
  setResponses: {},
})

export const useAIDigest = () => useContext(AIDigestContext)

export function PostPage({
  comments,
  post,
  community,
  mutate,
}: {
  comments: Item[]
  post: Item
  community: Group
  mutate: MutateType<Item>
}) {
  const {
    state: { isAdmin },
  } = useCommunityContext()

  const [enabled, setEnabled] = useState<{ [key: string]: boolean }>({})
  const [responses, setResponses] = useState<{ [key: string]: string }>({})
  const [open, setOpen] = React.useState<'post' | 'poll' | undefined>(undefined)

  useEffect(() => {
    const initialEnabled = {}
    analysisLabelsAndTypes.forEach(({ key }) => {
      initialEnabled[key] = true
    })
    setEnabled(initialEnabled)
  }, [])

  const [selectedTab, setSelectedTab] = useState(0)
  const handleTabChange = (index: number) => {
    setSelectedTab(index)
  }

  return (
    <AIDigestContext.Provider
      value={{
        enabled,
        setEnabled,
        responses,
        setResponses,
      }}
    >
      <Card className="flex h-full min-h-screen w-full grow flex-col rounded-lg border-0 bg-gradient-to-r from-background  from-25% to-background to-75% backdrop-blur-3xl  transition-colors  ">
        <div className="flex  h-full grow flex-col justify-stretch md:flex-row ">
          <div className="sticky top-0 flex flex-col gap-4 md:w-1/2 md:p-3">
            <div className="sticky top-0">
              <div className="rounded-xl border bg-card p-2 ">
                <ScrollArea className="col-span-12 flex max-h-[80vh] w-full flex-col gap-2 rounded  p-3 dark:border-gray-950/80 dark:bg-gray-950/20">
                  <PostItem post={post} group={community} refreshData={mutate} />
                </ScrollArea>
              </div>
            </div>
          </div>
          <div className="mt-3 flex h-full grow flex-col rounded-xl  md:w-1/2">
            <Tab.Group onChange={handleTabChange} defaultIndex={selectedTab} selectedIndex={selectedTab}>
              <Tab.List className="sticky top-0 z-10 flex flex-wrap justify-center gap-1  rounded-t-xl border bg-card py-5 md:justify-start md:px-4">
                {Object.entries(tabData).map(([name, Icon], index) => (
                  <TooltipTab key={index} name={name} Icon={Icon} />
                ))}
                <div className="flex w-full flex-wrap justify-center gap-1 md:justify-start md:px-7">
                  <ShowConnectIfNotConnected>
                    <DrawerDialog
                      open={open === 'post'}
                      setOpen={boolean => setOpen(boolean ? 'post' : undefined)}
                      label={
                        <div className="flex items-center gap-2">
                          <ChatBubbleBottomCenterTextIcon className="size-5" />
                          <span className="text-sm">New Comment</span>
                        </div>
                      }
                    >
                      <PostCreateForm
                        group={community}
                        post={post}
                        mutate={mutate}
                        handleClose={() => setOpen(undefined)}
                      />
                    </DrawerDialog>
                    <DrawerDialog
                      setOpen={boolean => setOpen(boolean ? 'poll' : undefined)}
                      open={open === 'poll'}
                      label={
                        <div className="flex items-center gap-2">
                          <PollIcon className="h-5 w-5" />
                          <span className="text-sm">New Poll</span>
                        </div>
                      }
                    >
                      <PollCreateForm
                        group={community}
                        post={post}
                        mutate={mutate}
                        handleClose={() => setOpen(undefined)}
                      />
                    </DrawerDialog>
                  </ShowConnectIfNotConnected>
                </div>
              </Tab.List>
              <Tab.Panels className="col-span-12 flex w-full flex-col rounded-b-xl border border-t-0 bg-card/50 px-4 py-8">
                <Tab.Panel className="flex flex-col gap-4 ">
                  {comments.map(comment => (
                    <div key={`comment_${comment.id}`} className="mb-2 rounded-xl border border-border bg-card/50  p-3">
                      <PostComment comment={comment} key={comment.id} />
                    </div>
                  ))}
                  {!comments.length && (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="text-base">No comments yet</div>
                    </div>
                  )}
                </Tab.Panel>

                {/* Polls */}
                <Tab.Panel className="flex flex-col ">
                  {!comments.length && (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="text-base">No Polls yet</div>
                    </div>
                  )}
                  {comments
                    .filter(comment => comment.kind == ContentType.POLL)
                    .map(comment => (
                      <div
                        key={`comment_as_poll_${comment.id}`}
                        className="mb-2 rounded-xl border border-border bg-card/50  p-3"
                      >
                        <PostComment comment={comment} key={comment.id} />
                      </div>
                    ))}
                </Tab.Panel>

                <Tab.Panel className="flex flex-col gap-4">
                  <div className="mb-2 rounded-xl border border-border bg-card  p-3">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <AnalysisCheckboxComponent />
                      <AIDigestButton postData={OutputDataToHTML(post?.description)} />
                    </div>
                  </div>
                  <DynamicAccordion />
                </Tab.Panel>

                {/* Community Tab */}
                <Tab.Panel className="z-0 mb-2 flex flex-col gap-4 p-3">
                  <CommunityCard variant="banner" community={community} isAdmin={isAdmin || false} />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </Card>
    </AIDigestContext.Provider>
  )
}
const tabData = {
  Replies: ChatIcon,
  Polls: PollIcon,
  AI: SparklesIcon,
  Info: InfoIcon,
} as const

const TooltipTab = ({ name, Icon }: { name: string; Icon: React.ComponentType<{ className: string }> }) => (
  <Tab
    className={({ selected }) =>
      ` border !px-2  ring-4 ring-transparent focus-visible:ring-transparent   ${
        selected ? `${buttonVariants({ variant: 'default' })}` : `${buttonVariants({ variant: 'secondary' })}`
      } `
    }
  >
    <Icon className="h-5 w-5" />
    {name}
  </Tab>
)

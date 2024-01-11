import { useCommunityContext } from '@/contexts/CommunityProvider'
import { useAccount } from 'wagmi'
import { useTranslation } from 'next-i18next'
import type { Dispatch, SetStateAction } from 'react'
import React, { useContext, useEffect, useState } from 'react'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { toast } from 'react-toastify'
import { CommunityCard } from '@components/CommunityCard/CommunityCard'
import { OutputDataToHTML } from '@components/Discourse/OutputDataToMarkDown'
import { PostItem } from '@components/Post/PostItem'
import { NewPostModal, PostComment } from '@components/Post/PostComments'
import { Tab } from '@headlessui/react'
import { SparklesIcon } from '@heroicons/react/20/solid'
import { ChatIcon, InfoIcon, PollIcon } from '@components/CommunityActionTabs'
import type { NewPostFormProps } from '@components/NewPostForm'
import { NewPostForm } from '@components/NewPostForm'
import type { Group, Item } from '@/types/contract/ForumInterface'
import { ContentType } from '@/lib/model'
import CreatePollUI from '@components/CreatePollUI'
import { Identity } from '@semaphore-protocol/identity'
import { useContentManagement } from '@/hooks/useContentManagement'
import { createNote, uploadIPFS } from '@/lib/utils'
import { ScrollArea } from '@/shad/ui/scroll-area'
import AIDigestButton from '@components/buttons/AIPostDigestButton'
import { Card } from '@/shad/ui/card'
import { DynamicAccordion } from '@components/Post/DynamicAccordion'
import { analysisLabelsAndTypes } from '@components/Post/AiAccordionConfig'
import { AnalysisCheckboxComponent } from '@components/Post/AiAnalysisCheckboxComponent'
import { Button } from '@/shad/ui/button'
import { ShowConnectIfNotConnected } from '@components/Connect/ConnectWallet'
import { useSWRConfig } from 'swr'
import { CommentClass } from '@/lib/comment'
import { GroupPostCommentAPI } from '@/lib/fetcher'
import { useUserIfJoined } from '@/contexts/UseUserIfJoined'
import { DrawerDialog } from '@components/DrawerDialog'
import PostCreateForm from '@components/form/post/post.createForm'
import PollCreateForm from '@components/form/poll/poll.createForm'

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
  mutate?: () => void
}) {
  const {
    state: { isAdmin },
  } = useCommunityContext()

  const [enabled, setEnabled] = useState<{ [key: string]: boolean }>({})
  const [responses, setResponses] = useState<{ [key: string]: string }>({})

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
      <Card className="flex h-screen min-h-full w-full grow flex-col rounded-lg border-0 bg-gradient-to-r from-background  from-25% to-background to-75% backdrop-blur-3xl  transition-colors  ">
        <ScrollArea className="flex-1 overflow-hidden ">
          <div className="flex  h-full grow flex-col justify-stretch md:flex-row ">
            <div className="  flex flex-col gap-4 p-3 md:w-1/2 ">
              <div className="sticky top-0">
                <div className="rounded-xl border p-2 dark:border-gray-700 dark:bg-gray-900 ">
                  <ScrollArea className="col-span-12 flex max-h-[80vh] w-full flex-col gap-2 rounded bg-white p-3 dark:border-gray-950/80 dark:bg-gray-950/20">
                    <PostItem post={post} group={community} refreshData={mutate} />
                  </ScrollArea>
                </div>
              </div>
            </div>
            <div className=" flex h-full grow flex-col gap-4 overflow-y-auto p-3 md:w-1/2">
              <Tab.Group onChange={handleTabChange} defaultIndex={selectedTab} selectedIndex={selectedTab}>
                <Tab.List className="sticky top-0 z-10 flex flex-wrap gap-4 rounded-xl border  bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                  {Object.entries(tabData).map(([name, Icon], index) => (
                    <TooltipTab key={index} name={name} Icon={Icon} />
                  ))}
                </Tab.List>
                <Tab.Panels className="col-span-12 flex w-full flex-col gap-4">
                  {/* Comments / Replies */}
                  <Tab.Panel className="flex flex-col gap-4 ">
                    <div className="sticky top-0 z-10 flex gap-4 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
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
                            <PostCreateForm group={community} post={post} mutate={mutate} />
                          </DrawerDialog>
                          <DrawerDialog
                            label={
                              <div className="flex items-center gap-2">
                                <PollIcon className="h-5 w-5" />
                                <span className="text-sm">New Poll</span>
                              </div>
                            }
                          >
                            <PollCreateForm group={community} post={post} mutate={mutate} />
                          </DrawerDialog>
                        </ShowConnectIfNotConnected>
                      </div>
                    </div>
                    {comments.map(comment => (
                      <div
                        key={`comment_${comment.id}`}
                        className="mb-2 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
                      >
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
                          className="mb-2 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
                        >
                          <PostComment comment={comment} key={comment.id} />
                        </div>
                      ))}
                  </Tab.Panel>

                  <Tab.Panel className="flex flex-col gap-4">
                    <div className="mb-2 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <AnalysisCheckboxComponent />
                        <AIDigestButton postData={OutputDataToHTML(post?.description)} />
                      </div>
                    </div>
                    <DynamicAccordion />
                  </Tab.Panel>

                  {/* Community Tab */}
                  <Tab.Panel className="mb-2 flex flex-col gap-4 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                    <CommunityCard variant="banner" community={community} isAdmin={isAdmin || false} />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </ScrollArea>
      </Card>
    </AIDigestContext.Provider>
  )
}
const tabData = {
  Replies: ChatIcon,
  Polls: PollIcon,
  AI: SparklesIcon,
  Info: InfoIcon,
}

const TooltipTab = ({ name, Icon }: { name: string; Icon: unknown }) => (
  <Tab
    className={({ selected }) =>
      ` bg-secondary text-secondary-foreground dark:bg-gray-950/50 ${
        selected ? 'bg-black/10 ring-[1px] ring-primary' : ''
      }`
    }
  >
    <Button variant="outline">
      <Icon className="h-5 w-5" />
      {name}
    </Button>
  </Tab>
)

const CreateCommentUI = ({ group, post }: { group: Group; post: Item; onSuccess?: () => void }) => {
  const groupId = group.groupId
  const user = useUserIfJoined(group.id.toString())

  const { t } = useTranslation()
  const { address } = useAccount()
  const { checkUserBalance } = useValidateUserBalance(group, address)

  const [isLoading, setIsLoading] = useState(false)

  const { mutate } = useSWRConfig()

  const commentInstance = new CommentClass(group.id.toString(), post.id.toString())

  const validateRequirements = () => {
    if (!address) {
      return toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })
    }
    if (!user) {
      return toast.error(t('toast.error.notJoined'), {
        type: 'error',
        toastId: 'min',
      })
    }

    return true
  }

  const { contentDescription, setContentDescription, setContentTitle, clearContent } = useContentManagement({
    isPostOrPoll: false,
    defaultContentDescription: undefined,
    defaultContentTitle: undefined,
  })

  const addComment: () => Promise<void> = async () => {
    if (validateRequirements() !== true) {
      return
    }
    if (!contentDescription) {
      toast.error('Please enter a title and description', {
        toastId: 'missingTitleOrDesc',
      })
      return
    }
    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) {
      return
    }

    setIsLoading(true)
    const currentDate = new Date()
    const _message = currentDate.getTime() + '#' + JSON.stringify(contentDescription)

    const cid = await uploadIPFS(_message)
    if (!cid) {
      throw 'Upload to IPFS failed'
    }

    try {
      const userIdentity = new Identity(address)

      const note = await createNote(userIdentity)

      const tempCache: Item = {
        description: contentDescription,
        kind: ContentType.COMMENT,
        parentId: post.id.toString(),
        groupId: groupId as string,
        childIds: [],
        upvote: 0,
        downvote: 0,
        isMutating: true,
        note: note.toString(),
      }
      mutate(
        GroupPostCommentAPI(groupId as string, post.id.toString()),
        async (data: any) => {
          try {
            const response = await commentInstance?.create({
              commentContent: {
                description: contentDescription,
              },
              address,
              postedByUser: user,
              groupId: groupId?.toString(),
              setWaiting: setIsLoading,
              onIPFSUploadSuccess() {
                const element = document.getElementById(`new_item`)
                element?.scrollIntoView({ behavior: 'smooth' })
              },
            })
            if (response?.status === 200) {
              setIsLoading(false)
              clearContent()
              console.log('response', response)
              const { args } = response.data
              const lastPost = {
                ...tempCache,
                id: +args[2]?.hex,
                isMutating: false,
              }
              return { ...data, comments: [...data.comments, lastPost] }
            } else {
              console.log('error', response)
              setIsLoading(false)
            }
            return data
          } catch (error) {
            setIsLoading(false)
            toast.error('Failed to create comment')
            return data
          }
        },
        {
          optimisticData: (data: any) => {
            if (data) {
              return {
                ...data,
                comments: [...data.comments, tempCache],
              }
            }
          },
          rollbackOnError: true,
          revalidate: false,
        }
      )
    } catch (error) {
      setIsLoading(false)
      toast.error('Failed to create comment')
    }
  }

  const propsForNewPost: NewPostFormProps = {
    editorId: `${groupId}_comment`,
    submitButtonText: t('button.submit') as string,
    openFormButtonText: t('button.newComment') as string,
    description: contentDescription,
    setDescription: setContentDescription,
    handleSubmit: addComment,
    showButtonWhenFormOpen: false,
    setTitle: setContentTitle as Dispatch<SetStateAction<string | null>>,
    resetForm: () => {},
    isReadOnly: false,
    isSubmitting: isLoading,
    title: '',
    isEditable: true,
    itemType: 'comment',
    actionType: 'new',
    classes: NewPostModal,
  }

  return <NewPostForm {...propsForNewPost} />
}

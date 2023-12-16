import {
  useActiveUser,
  useCommunityContext,
  useUserIfJoined,
} from '@/contexts/CommunityProvider'
import { useAccount } from 'wagmi'
import { useTranslation } from 'next-i18next'
import type { Dispatch, SetStateAction } from 'react'
import React, { useContext, useEffect, useState } from 'react'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { utils } from 'ethers'
import { toast } from 'react-toastify'
import { CommunityCard } from '@components/CommunityCard/CommunityCard'
import { VoteDownButton, VoteUpButton } from '@components/buttons'
import { OutputDataToHTML } from '@components/Discourse/OutputDataToMarkDown'
import { PostItem } from '@components/Post/PostItem'
import { NewPostModal, PostComment } from '@components/Post/PostComments'
import { Tab } from '@headlessui/react'
import { SparklesIcon } from '@heroicons/react/20/solid'
import { ChatIcon, InfoIcon, PollIcon } from '@components/CommunityActionTabs'
import type { NewPostFormProps } from '@components/NewPostForm'
import { NewPostForm } from '@components/NewPostForm'
import type { Group, Item } from '@/types/contract/ForumInterface'
import type { ItemCreationRequest } from '@/lib/model'
import { ContentType } from '@/lib/model'
import CreatePollUI from '@components/CreatePollUI'
import { Group as SemaphoreGroup } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import { useContentManagement } from '@/hooks/useContentManagement'
import { createComment, vote } from '@/lib/api'
import { generateProof } from '@semaphore-protocol/proof'
import {
  createNote,
  fetchUsersFromSemaphoreContract,
  getBytes32FromIpfsHash,
  hashBytes,
  hashBytes2,
  uploadIPFS,
} from '@/lib/utils'
import { emptyPollRequest } from '@/lib/item'
import { ScrollArea } from '@/shad/ui/scroll-area'
import AIDigestButton from '@components/buttons/AIPostDigestButton'
import { Card } from '@/shad/ui/card'
import { DynamicAccordion } from '@components/Post/DynamicAccordion'
import { analysisLabelsAndTypes } from '@components/Post/AiAccordionConfig'
import { AnalysisCheckboxComponent } from '@components/Post/AiAnalysisCheckboxComponent'
import { Button } from '@/shad/ui/button'
import { ShowConnectIfNotConnected } from '@components/Connect/ConnectWallet'

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
  refreshData,
}: {
  comments: Item[]
  post: Item
  community: Group
  refreshData?: () => void
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
                  <VoteForItemUI
                    postId={post.id}
                    post={post}
                    group={community}
                    onSuccess={refreshData}
                  />
                  <ScrollArea className="col-span-12 flex max-h-[80vh] w-full flex-col gap-2 rounded bg-white p-3 dark:border-gray-950/80 dark:bg-gray-950/20">
                    <PostItem
                      post={post}
                      group={community}
                      refreshData={refreshData}
                    />
                  </ScrollArea>
                </div>
              </div>
            </div>
            <div className=" flex h-full grow flex-col gap-4 overflow-y-auto p-3 md:w-1/2">
              <Tab.Group
                onChange={handleTabChange}
                defaultIndex={selectedTab}
                selectedIndex={selectedTab}
              >
                <Tab.List className="sticky top-0 z-10 flex flex-wrap gap-4 rounded-xl border  bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                  {Object.entries(tabData).map(([name, Icon], index) => (
                    <TooltipTab key={index} name={name} Icon={Icon} />
                  ))}
                </Tab.List>
                <Tab.Panels className="col-span-12 flex w-full flex-col gap-4">
                  {/* Comments / Replies */}
                  <Tab.Panel className="flex flex-col gap-4 ">
                    <div className="sticky top-0 z-10 flex gap-4 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                      <ShowConnectIfNotConnected>
                        <div className="flex gap-4">
                          {selectedTab === 0 && (
                            <CreateCommentUI
                              post={post}
                              group={community}
                              onSuccess={refreshData}
                            />
                          )}
                          {(selectedTab === 1 || selectedTab === 0) && (
                            <CreatePollUI
                              post={post}
                              group={community}
                              onSuccess={refreshData}
                            />
                          )}
                        </div>
                      </ShowConnectIfNotConnected>
                    </div>
                    {comments.map(comment => (
                      <div
                        key={`comment_${comment.id}`}
                        className="mb-2 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
                      >
                        <PostComment
                          comment={comment}
                          key={comment.id}
                          onSuccess={refreshData}
                        />
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
                          <PostComment
                            comment={comment}
                            key={comment.id}
                            onSuccess={refreshData}
                          />
                        </div>
                      ))}
                  </Tab.Panel>

                  <Tab.Panel className="flex flex-col gap-4">
                    <div className="mb-2 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <AnalysisCheckboxComponent />
                        <AIDigestButton
                          postData={OutputDataToHTML(post?.description)}
                        />
                      </div>
                    </div>
                    <DynamicAccordion />
                  </Tab.Panel>

                  {/* Community Tab */}
                  <Tab.Panel className="mb-2 flex flex-col gap-4 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                    <CommunityCard
                      variant="banner"
                      community={community}
                      isAdmin={isAdmin || false}
                    />
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

const TooltipTab = ({ name, Icon }) => (
  <Tab
    className={({ selected }) =>
      ` bg-secondary text-secondary-foreground dark:bg-gray-950/50 ${
        selected ? 'ring-[1px] ring-primary bg-black/10' : ''
      }`
    }
  >
    <Button variant="outline">
      <Icon className="h-5 w-5" />
      {name}
    </Button>
  </Tab>
)

const CreateCommentUI = ({
  group,
  post,
  onSuccess,
}: {
  group: Group
  post: Item
  onSuccess?: () => void
}) => {
  const groupId = group.groupId
  const user = useUserIfJoined(group.id.toString())
  const activeUser = useActiveUser({ groupId: group.id })
  const { t } = useTranslation()
  const { address } = useAccount()
  const { checkUserBalance } = useValidateUserBalance(group, address)

  const [isLoading, setIsLoading] = useState(false)

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

  const {
    contentDescription,
    setContentDescription,
    setContentTitle,
    clearContent,
  } = useContentManagement({
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
    const _message =
      currentDate.getTime() + '#' + JSON.stringify(contentDescription)

    const cid = await uploadIPFS(_message)
    if (!cid) {
      throw 'Upload to IPFS failed'
    }

    const signal = getBytes32FromIpfsHash(cid)
    const extraNullifier = hashBytes(signal).toString()
    const semaphoreGroup = new SemaphoreGroup(group.id)

    const users = await fetchUsersFromSemaphoreContract(groupId)
    users.forEach(u => semaphoreGroup.addMember(BigInt(u)))

    try {
      const userIdentity = new Identity(address)

      const note = await createNote(userIdentity)

      const fullProof = await generateProof(
        userIdentity,
        semaphoreGroup,
        extraNullifier,
        hashBytes(signal)
      )

      const request: ItemCreationRequest = {
        contentCID: signal,
        merkleTreeRoot: fullProof.merkleTreeRoot.toString(),
        nullifierHash: fullProof.nullifierHash.toString(),
        note: note.toString(),
      }

      await createComment({
        groupId: groupId as string,
        parentId: post.id.toString(),
        request: request,
        solidityProof: fullProof.proof,
        asPoll: false,
        pollRequest: emptyPollRequest,
      }).then(async res => {
        onSuccess && onSuccess()
        toast.success('Comment created successfully')
        clearContent()
        return res
      })
      setIsLoading(false)
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

export const VoteForItemUI = ({
  post,
  postId,
  group,
  onSuccess,
}: {
  post: Item
  postId: string
  group: Group
  onSuccess?: () => void
}) => {
  const groupId = group?.id?.toString()
  const user = useUserIfJoined(groupId)
  const { t } = useTranslation()
  const { address } = useAccount()
  const { checkUserBalance } = useValidateUserBalance(group, address)

  const [isLoading, setIsLoading] = useState(false)

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

  const voteForPost = async (itemId: number, voteType: 0 | 1) => {
    if (validateRequirements() !== true) {
      return
    }

    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) {
      return
    }

    setIsLoading(true)
    try {
      const voteCmdNum = hashBytes2(+itemId, 'vote')
      const signal = utils.hexZeroPad('0x' + voteCmdNum.toString(16), 32)
      const extraNullifier = voteCmdNum.toString()
      const semaphoreGroup = new SemaphoreGroup(BigInt(groupId))
      const users = await fetchUsersFromSemaphoreContract(groupId)
      users.forEach(u => semaphoreGroup.addMember(BigInt(u)))
      const userIdentity = new Identity(address)

      const { proof, nullifierHash, merkleTreeRoot } = await generateProof(
        userIdentity,
        semaphoreGroup,
        extraNullifier,
        signal
      )

      return vote(
        itemId.toString(),
        groupId,
        voteType,
        merkleTreeRoot.toString(),
        nullifierHash.toString(),
        proof
      )
        .then(async res => {
          onSuccess && onSuccess()
          toast.success('Vote created successfully')
          setIsLoading(false)
          return res
        })
        .catch(err => {
          console.log(err)
          toast.error('Failed to create vote')
          setIsLoading(false)
        })
    } catch (error) {
      console.log(error)
      toast(t('alert.voteFailed'))
      setIsLoading(false)
    }
  }

  return (
    <>
      <VoteUpButton
        isConnected={!!address}
        isJoined={!!user}
        isLoading={isLoading}
        onClick={e => voteForPost(Number(post.id), 0)}
        disabled={isLoading || !address}
      >
        <span className="font-bold text-gray-500 dark:text-gray-300">
          {post.upvote}
        </span>
      </VoteUpButton>
      <VoteDownButton
        isConnected={!!address}
        isJoined={!!user}
        isLoading={isLoading}
        onClick={() => voteForPost(Number(post.id), 1)}
        disabled={isLoading || !address}
      >
        <span className="font-bold  text-gray-500 dark:text-gray-300">
          {post.downvote}
        </span>
      </VoteDownButton>
    </>
  )
}

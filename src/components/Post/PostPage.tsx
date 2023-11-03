import { useActiveUser, useCommunityContext, useUserIfJoined } from '@/contexts/CommunityProvider'
import { useAccount } from 'wagmi'
import { useTranslation } from 'next-i18next'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { BigNumber, utils } from 'ethers'
import { toast } from 'react-toastify'
import { CommunityCard } from '@components/CommunityCard/CommunityCard'
import { VoteDownButton, VoteUpButton } from '@components/buttons'
import { OutputDataToHTML } from '@components/Discourse/OutputDataToMarkDown'
import { PostItem } from '@components/Post/PostItem'
import { NewPostModal, PostComment, TempComment } from '@components/Post/PostComments'
import { Tab } from '@headlessui/react'
import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/router'
import { ChatIcon, InfoIcon, PollIcon } from '@components/CommunityActionTabs'
import { NewPostForm, NewPostFormProps } from '@components/NewPostForm'
import { useItemsSortedByVote } from '@/hooks/useItemsSortedByVote'
import { SortByOption } from '@components/SortBy'
import { Group, Item } from '@/types/contract/ForumInterface'
import { CommentClass } from '@/lib/comment'
import { Post } from '@/lib/post'
import { ContentType, ItemCreationRequest, ReputationProofStruct } from '@/lib/model'
import CreatePollUI from '@components/CreatePollUI'
import ToolTip from '@components/HOC/ToolTip'
import { Group as SemaphoreGroup } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import { UnirepUser } from '@/lib/unirep'
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
import { mutate } from 'swr'
import { getGroupWithPostAndCommentData } from '@/lib/fetcher'
import { emptyPollRequest } from '@/lib/item'
import { ScrollArea } from '@/shad/ui/scroll-area'
import ReputationCard from '../ReputationCard'
import AIDigestButton, { AIDigestContext } from '@components/buttons/AIPostDigestButton'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import { CheckCircle, WandIcon } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shad/ui/accordion'
import { Card } from '@/shad/ui/card'

export function PostPage({
  comments,
  post,
  community,
}: {
  postInstance: Post
  comments: Item[]
  post: Item
  community: Group
  commentInstance: CommentClass
}) {
  const postId = post.id
  const { address } = useAccount()

  const {
    state: { isAdmin, isModerator },
  } = useCommunityContext()
  const [summarizeResponse, setSummarizeResponse] = React.useState('')
  const [swotResponse, setSwotResponse] = React.useState('')
  const [causalChainResponse, setCausalChainResponse] = React.useState('')
  const [secondOrderResponse, setSecondOrderResponse] = React.useState('')
  const [unbiasedCritiqueResponse, setUnbiasedCritiqueResponse] = React.useState('')
  const [prosAndConsResponse, setProsAndConsResponse] = React.useState('')

  const [tempComments, setTempComments] = useState<TempComment[]>([])

  const [commentsSortBy, setCommentsSortBy] = useState<SortByOption>('highest')

  const sortedCommentsData = useItemsSortedByVote(tempComments, comments, commentsSortBy)

  const [selectedTab, setSelectedTab] = useState(0)
  const handleTabChange = (index: number) => {
    setSelectedTab(index)
  }

  return (
    <AIDigestContext.Provider
      value={{
        responses: {
          swotResponse,
          summarizeResponse,
          causalChainResponse,
          secondOrderResponse,
          unbiasedCritiqueResponse,
          prosAndConsResponse,
        },
        setResponses: {
          setSwotResponse,
          setSummarizeResponse,
          setCausalChainResponse,
          setSecondOrderResponse,
          setUnbiasedCritiqueResponse,
          setProsAndConsResponse,
        },
      }}
    >
      <div className="mb-6">
        <ReputationCard />
      </div>
      <Card className="flex h-screen min-h-full w-full grow flex-col rounded-lg border-0 bg-gradient-to-r from-background  from-25% to-background to-75% backdrop-blur-3xl  transition-colors  ">
        <div className="flex-1 overflow-hidden ">
          <div className="flex h-full grow flex-col justify-stretch md:flex-row ">
            <div className=" flex flex-col gap-4 p-3 md:w-1/2 ">
              <div className="sticky top-0 z-10 flex gap-4 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                <VoteForItemUI postId={post.id} post={post} group={community} />
              </div>
              <ScrollArea className=" max-h-[calc(90vh - 200px)] col-span-12 flex   w-full  flex-col gap-2 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                <PostItem post={post} group={community} />
              </ScrollArea>
            </div>
            <div className=" flex h-full grow flex-col gap-4 p-3 md:w-1/2">
              <Tab.Group onChange={handleTabChange} defaultIndex={selectedTab} selectedIndex={selectedTab}>
                <Tab.List className="sticky top-0 z-10 flex gap-4 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                  {['All Replies', 'Polls', 'AI', 'Community Info'].map((tooltip, index) => (
                    <Tab
                      className={({ selected }) =>
                        `  rounded bg-secondary text-secondary-foreground  ${selected && ' ring-[1px] ring-primary'}`
                      }
                      key={index}
                    >
                      {tooltip === 'Community Info' && (
                        <ToolTip
                          tooltip={tooltip}
                          buttonProps={{
                            variant: 'link',
                          }}
                        >
                          <InfoIcon className={'h-7 w-7'} />
                        </ToolTip>
                      )}
                      {tooltip === 'Polls' && (
                        <ToolTip
                          tooltip={tooltip}
                          buttonProps={{
                            variant: 'link',
                          }}
                        >
                          <PollIcon className={'h-7 w-7 '} />
                        </ToolTip>
                      )}
                      {tooltip === 'All Replies' && (
                        <ToolTip
                          tooltip={tooltip}
                          buttonProps={{
                            variant: 'link',
                          }}
                        >
                          <ChatIcon className={'h-7 w-7'} />
                        </ToolTip>
                      )}
                      {tooltip === 'AI' && (
                        <ToolTip
                          tooltip={tooltip}
                          buttonProps={{
                            variant: 'link',
                          }}
                        >
                          <WandIcon className={'h-7 w-7'} />
                        </ToolTip>
                      )}
                    </Tab>
                  ))}
                </Tab.List>

                {selectedTab === 2 && (
                  <div className={'mb-2 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900'}>
                    <span className={'inline-flex items-center gap-2 text-[10px] text-yellow-700'}>
                      <ExclamationCircleIcon className={'w-4'} />
                      These processes may take 1-2 minutes
                    </span>
                    <div className={'flex gap-2'}>
                      <AIDigestButton postData={OutputDataToHTML(post?.description)} postTitle={post.title} />
                    </div>
                  </div>
                )}

                {(selectedTab === 0 || selectedTab === 1) && (
                  <div className="sticky top-0 z-10 flex gap-4 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                    <div className={'flex gap-4'}>
                      {selectedTab === 0 && <CreateCommentUI post={post} group={community} />}
                      {(selectedTab === 1 || selectedTab === 0) && <CreatePollUI post={post} group={community} />}
                    </div>
                  </div>
                )}

                <Tab.Panels className={'scrollbar col-span-12 flex w-full flex-col gap-4'}>
                  {/* Comments / Replies */}
                  <Tab.Panel className="flex flex-col gap-4 ">
                    {sortedCommentsData.map(comment => (
                      <div
                        key={`comment_${comment.id}`}
                        className="mb-2 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
                      >
                        <PostComment comment={comment} key={comment.id} />
                      </div>
                    ))}
                    {!sortedCommentsData.length && (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="text-md">No comments yet</div>
                      </div>
                    )}
                  </Tab.Panel>

                  {/* Polls */}
                  <Tab.Panel className="flex flex-col ">
                    {!sortedCommentsData.length && (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="text-md">No Polls yet</div>
                      </div>
                    )}
                    {sortedCommentsData
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

                  {/* AI Tab */}
                  <Tab.Panel className="flex flex-col gap-4">
                    <Accordion
                      type="single"
                      collapsible
                      className="mb-2 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
                    >
                      <AccordionItem value="summarize">
                        <AccordionTrigger>
                          <span className={'inline-flex gap-4'}>
                            <CheckCircle className={summarizeResponse ? 'text-green-500' : 'text-gray-500'} /> Summarize
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <EditorJsRenderer data={summarizeResponse} isHtml={true} />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="swot">
                        <AccordionTrigger>
                          <span className={'inline-flex gap-4'}>
                            <CheckCircle className={swotResponse ? 'text-green-500' : 'text-gray-500'} /> SWOT
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <EditorJsRenderer data={swotResponse} isHtml={true} />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="causalChain">
                        <AccordionTrigger>
                          <span className={'inline-flex gap-4'}>
                            <CheckCircle className={causalChainResponse ? 'text-green-500' : 'text-gray-500'} />
                            Causal Chain{' '}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <EditorJsRenderer data={causalChainResponse} isHtml={true} />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="secondOrder">
                        <AccordionTrigger>
                          <span className={'inline-flex gap-4'}>
                            <CheckCircle className={secondOrderResponse ? 'text-green-500' : 'text-gray-500'} />
                            Second Order{' '}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <EditorJsRenderer data={secondOrderResponse} isHtml={true} />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="unbiasedCritique">
                        <AccordionTrigger>
                          <span className={'inline-flex gap-4'}>
                            <CheckCircle className={unbiasedCritiqueResponse ? 'text-green-500' : 'text-gray-500'} />
                            Unbiased Critique
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <EditorJsRenderer data={unbiasedCritiqueResponse} isHtml={true} />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="prosAndCons">
                        <AccordionTrigger>
                          <span className={'inline-flex gap-4'}>
                            <CheckCircle className={prosAndConsResponse ? 'text-green-500' : 'text-gray-500'} />
                            Pros and Cons{' '}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <EditorJsRenderer data={prosAndConsResponse} isHtml={true} />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </Tab.Panel>

                  {/* Community Tab */}
                  <Tab.Panel className="mb-2 flex flex-col gap-4 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                    <CommunityCard variant={'banner'} community={community} isAdmin={isAdmin || false} />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </div>
      </Card>
    </AIDigestContext.Provider>
  )
}

interface HandleVoteParams {
  e: any
  vote: 'upvote' | 'downvote'
  voteForPost: (itemId: number, voteType: 0 | 1) => Promise<void>
  itemId: any
  setIsLoading: any
}

export const handleVote = async ({ e, vote, voteForPost, itemId, setIsLoading }: HandleVoteParams): Promise<void> => {
  e.stopPropagation()
  e.preventDefault()
  if (isNaN(itemId)) {
    toast.error('Invalid post id')
    return
  }
  setIsLoading(true)
  const val = vote === 'upvote' ? 0 : 1
  const voteResponse = await voteForPost(BigNumber.from(itemId).toNumber(), val)
  if (voteResponse) {
    console.log('voteResponse', voteResponse)
  }
  setIsLoading(false)
}

const CreateCommentUI = ({ group, post }: { group: Group; post: Item }) => {
  const groupId = group.groupId
  const user = useUserIfJoined(group.id.toString())
  const activeUser = useActiveUser({ groupId: group.id })
  const { t } = useTranslation()
  const { address } = useAccount()
  const { checkUserBalance } = useValidateUserBalance(group, address)

  const [isLoading, setIsLoading] = useState(false)

  const validateRequirements = () => {
    if (!address) return toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })
    if (!user) return toast.error(t('toast.error.notJoined'), { type: 'error', toastId: 'min' })

    return true
  }

  const {
    contentDescription,
    setContentDescription,
    tempContents,
    contentTitle,
    setTempContents,
    setContentTitle,
    clearContent,
  } = useContentManagement({
    isPost: false,
    defaultContentDescription: undefined,
    defaultContentTitle: undefined,
  })

  const addComment: () => Promise<void> = async () => {
    if (validateRequirements() !== true) return
    if (!contentDescription) {
      toast.error('Please enter description', { toastId: 'missingTitleOrDesc' })
      return
    }
    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return

    setIsLoading(true)
    let currentDate = new Date()
    const _message = currentDate.getTime() + '#' + JSON.stringify({title: '', description: contentDescription, createdAt: currentDate.getTime(), updatedAt: currentDate.getTime()})

    const cid = await uploadIPFS(_message)
    if (!cid) {
      throw 'Upload to IPFS failed'
    }

    const signal = getBytes32FromIpfsHash(cid)
    const extraNullifier = hashBytes(signal).toString()
    let semaphoreGroup = new SemaphoreGroup(group.id)

    const users = await fetchUsersFromSemaphoreContract(groupId)
    users.forEach(u => semaphoreGroup.addMember(BigInt(u)))

    try {
      const userIdentity = new Identity(`${address}_${group.id}_${activeUser?.name || 'anon'}`)

      console.log('userIdentity', userIdentity)

      const unirepUser = new UnirepUser(userIdentity)
      await unirepUser.updateUserState()
      const userState = await unirepUser.getUserState()
      const note = await createNote(userIdentity)

      let reputationProof = await userState.genProveReputationProof({
        epkNonce: 0,
        minRep: 0,
        graffitiPreImage: 0,
      })

      const epochData = unirepUser.getEpochData()
      const epoch: ReputationProofStruct = {
        publicSignals: epochData.publicSignals,
        proof: epochData.proof,
        publicSignalsQ: reputationProof.publicSignals,
        proofQ: reputationProof.proof,
        ownerEpoch: BigNumber.from(epochData.epoch)?.toString(),
        ownerEpochKey: epochData.epochKey,
      }

      const fullProof = await generateProof(userIdentity, semaphoreGroup, extraNullifier, hashBytes(signal))

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
        unirepProof: epoch,
        asPoll: false,
        pollRequest: emptyPollRequest,
      }).then(async res => {
        await mutate(getGroupWithPostAndCommentData(groupId, post.id))
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

export const VoteForItemUI = ({ post, postId, group }: { post: Item; postId: string; group: Group }) => {
  const groupId = group?.id?.toString()
  const user = useUserIfJoined(groupId)
  const { t } = useTranslation()
  const { address } = useAccount()
  const { checkUserBalance } = useValidateUserBalance(group, address)

  const [isLoading, setIsLoading] = useState(false)

  const validateRequirements = () => {
    if (!address) return toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })
    if (!user) return toast.error(t('toast.error.notJoined'), { type: 'error', toastId: 'min' })

    return true
  }

  const voteForPost = async (itemId: number, voteType: 0 | 1) => {
    if (validateRequirements() !== true) return

    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return

    setIsLoading(true)
    try {
      const voteCmdNum = hashBytes2(+itemId, 'vote')
      const signal = utils.hexZeroPad('0x' + voteCmdNum.toString(16), 32)
      const extraNullifier = voteCmdNum.toString()
      let semaphoreGroup = new SemaphoreGroup(BigInt(groupId))
      const users = await fetchUsersFromSemaphoreContract(groupId)
      users.forEach(u => semaphoreGroup.addMember(BigInt(u)))
      const userIdentity = new Identity(`${address}_${group.id}_anon`)

      const unirepUser = new UnirepUser(userIdentity)
      await unirepUser.updateUserState()
      const userState = await unirepUser.getUserState()
      let reputationProof = await userState.genProveReputationProof({
        epkNonce: 0,
        minRep: 0,
        graffitiPreImage: 0,
      })

      const { proof, nullifierHash, merkleTreeRoot } = await generateProof(
        userIdentity,
        semaphoreGroup,
        extraNullifier,
        signal
      )

      const epochData = unirepUser.getEpochData()
      const voteProofData: ReputationProofStruct = {
        publicSignals: epochData.publicSignals,
        proof: epochData.proof,
        publicSignalsQ: reputationProof.publicSignals,
        proofQ: reputationProof.proof,
        ownerEpoch: BigNumber.from(epochData.epoch)?.toString(),
        ownerEpochKey: epochData.epochKey,
      }

      return vote(
        itemId.toString(),
        groupId,
        voteType,
        merkleTreeRoot.toString(),
        nullifierHash.toString(),
        proof,
        voteProofData
      )
        .then(async res => {
          await mutate(getGroupWithPostAndCommentData(groupId, postId))
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
        isJoined={user ? true : false}
        isLoading={isLoading}
        onClick={e => voteForPost(Number(post.id), 0)}
        disabled={isLoading || !address}
      >
        <span className="font-bold text-gray-500 dark:text-gray-300">{post.upvote}</span>
      </VoteUpButton>
      <VoteDownButton
        isConnected={!!address}
        isJoined={user ? true : false}
        isLoading={isLoading}
        onClick={e => voteForPost(Number(post.id), 1)}
        disabled={isLoading || !address}
      >
        <span className="font-bold  text-gray-500 dark:text-gray-300">{post.downvote}</span>
      </VoteDownButton>
    </>
  )
}

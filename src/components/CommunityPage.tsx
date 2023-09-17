import React, { useRef, useState } from 'react'
import { Post } from '@/lib/post'
import { useActiveUser, useUserIfJoined, useUsers } from '@/contexts/CommunityProvider'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import SortBy, { SortByOption } from '@components/SortBy'
import { useUnirepSignUp } from '@/hooks/useUnirepSignup'
import { User } from '@/lib/model'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { useLoaderContext } from '@/contexts/LoaderContext'
import { toast } from 'react-toastify'
import { useItemsSortedByVote } from '@/hooks/useItemsSortedByVote'
import clsx from 'clsx'
import { NewPostForm } from '@components/NewPostForm'
import { PostList } from '@components/Post/postList'
import { NoPosts } from '@components/Post/NoPosts'
import { Group, Item } from '@/types/contract/ForumInterface'
import CreatePollUI from './CreatePollUI'
import ReputationCard from '@components/ReputationCard'
import { useContentManagement } from '@/hooks/useContentManagement'
import { CommunityActionTabs } from '@components/CommunityActionTabs'
import { CommunityCardHeader, CommunityLogo } from '@components/CommunityCard/CommunityCardHeader'
import { CommunityCardContext } from '@components/CommunityCard/CommunityCard'
import { useEditItem } from '@/hooks/useEditItem'
import EditGroupNavigationButton, { useCheckIsOwner } from '@components/EditGroupNavigationButton'
import { PostItem } from '@components/Post/postItem'

export function CommunityPage({
  children,
  postInstance,
  community,
  posts,
  post,
  postId,
}: {
  children?: React.ReactNode
  postId: string | undefined
  community: Group
  posts?: Item[]
  post?: Item
  postInstance: Post
}) {
  const groupId = postInstance.groupId
  const user = useUserIfJoined(groupId as string)
  const unirepUser = useUnirepSignUp({ groupId: groupId, name: (user as User)?.name })
  const activeUser = useActiveUser({ groupId })
  const { address } = useAccount()
  const users = useUsers()
  const { t } = useTranslation()

  const [sortBy, setSortBy] = useState<SortByOption>('highest')
  const { editItem } = useEditItem({
    postId,
    groupId,
    isAdminOrModerator: false,
    setIsLoading: () => {},
  })

  const { checkUserBalance } = useValidateUserBalance(community, address)
  const { setIsLoading, isLoading: isContextLoading } = useLoaderContext()
  const postEditorRef = useRef<any>()

  const validateRequirements = () => {
    if (!address) return toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })
    if (!user) return toast.error(t('toast.error.notJoined'), { type: 'error', toastId: 'min' })

    return true
  }

  const { contentDescription, setContentDescription, tempContents, contentTitle, setTempContents, setContentTitle } =
    useContentManagement({
      isPost: true,
      defaultContentDescription: post?.description,
      defaultContentTitle: post?.title,
    })

  const addPost: () => Promise<void> = async () => {
    if (validateRequirements() !== true) return

    if (!contentTitle || !contentDescription) {
      console.log('Please enter a title and description')
      toast.error('Please enter a title and description', { toastId: 'missingTitleOrDesc' })
      return
    }

    let ipfsHash

    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return

    setIsLoading(true)

    try {
      const { status } = await postInstance?.create(
        {
          title: contentTitle,
          description: contentDescription,
        },
        address,
        users,
        activeUser,
        groupId as string,
        setIsLoading,
        (post, cid) => {
          ipfsHash = cid
          setTempContents([
            {
              id: cid,
              ...post,
            },
            ...tempContents,
          ])
        }
      )

      if (status === 200) {
        clearInput()
        setIsLoading(false)
      } else {
        setIsLoading(false)
        console.log('Some error occurred, please try again!')
      }
    } catch (error) {
      console.log('Some error occurred, please try again!', error)
      setIsLoading(false)

      // toast({
    } finally {
      // setLoading.off()
      setTempContents(prevPosts => {
        const tempPostIndex = prevPosts.findIndex(t => t.id === ipfsHash)
        if (tempPostIndex > -1) {
          const tempPostsCopy = [...prevPosts]
          tempPostsCopy.splice(tempPostIndex, 1)
          return tempPostsCopy
        }
      })
    }
  }

  const handleSortChange = (newSortBy: SortByOption) => {
    setSortBy(newSortBy)
  }

  const sortedData = useItemsSortedByVote(tempContents, posts, sortBy)

  const voteForPost = React.useCallback(
    async (postId, voteType: 0 | 1) => {
      if (validateRequirements() !== true) return setIsLoading(false)
      const hasSufficientBalance = await checkUserBalance()
      if (!hasSufficientBalance) {
        toast.error(t('toast.error.insufficientBalance'), { toastId: 'insufficientBalance' })
        setIsLoading(false)
        return
      }

      try {
        const response = await postInstance?.vote(voteType, address, users, activeUser, postId, groupId)

        if (response?.message?.includes('ProveReputation_227')) {
          toast.error(t('error.notEnoughReputation'), { toastId: 'notEnoughReputation' })
        }
        const { status } = response

        if (status === 200) {
          setIsLoading(false)
          toast.success(t('toast.success.vote'), { toastId: 'vote' })
          postInstance?.updatePostsVote(postId, voteType, false).then(() => setIsLoading(false))
        }
      } catch (error) {
        setIsLoading(false)
        toast(t('toast.error.vote'), { toastId: 'vote' })
      }
    },
    [user, address, groupId, users, activeUser, postInstance]
  )

  const clearInput = isEdit => {
    if (isEdit) {
      // setPostEditing(false)
      setContentTitle(post?.title)
      setContentDescription(post?.description)
      return
    } else {
      setContentTitle('')
      setContentDescription(undefined)
      postEditorRef?.current?.clear?.()
    }
  }

  return (
    <div className={clsx('min-h-screen !text-gray-900 h-fit')}>
      <div className={'group relative flex flex-col gap-4 overflow-x-clip '}>
        <CommunityCardContext.Provider value={community}>
          <div className={'relative z-50'}>
            <EditGroupNavigationButton community={community} />
          </div>
          <CommunityCardHeader showDescription={false} />
          <div className={'flex items-center gap-4'}>
            <CommunityLogo />
            <span className={' p-4'}>{community.groupDetails.description}</span>
          </div>

          <CommunityActionTabs
            defaultTab={'chat'}
            tabs={{
              chat: {
                hidden: false,
                onClick: () => {},
                panel: (
                  <div>
                    <div className={'relative flex items-center gap-4  px-3'}>
                      <CreatePollUI groupId={groupId} />
                      <NewPostForm
                        editorId={`${groupId}_post`}
                        submitButtonText={t('button.submit') as string}
                        openFormButtonText={t('button.newPost') as string}
                        description={contentDescription}
                        setDescription={setContentDescription}
                        handleSubmit={addPost}
                        editorReference={postEditorRef}
                        showButtonWhenFormOpen={true}
                        setTitle={setContentTitle}
                        resetForm={() => clearInput(true)}
                        isReadOnly={false}
                        isSubmitting={isContextLoading}
                        title={contentTitle as string}
                        isEditable={true}
                        itemType={'post'}
                        handlerType={'new'}
                        classes={{
                          rootClosed: '!w-fit !p-0',
                          openFormButtonOpen: 'bg-red-500 text-white border-none rounded-sm',
                        }}
                      />
                      <div className={'flex-grow'} />
                      <SortBy onSortChange={handleSortChange} targetType="posts" />
                    </div>
                    <PostList posts={sortedData} />
                    {sortedData?.length === 0 && <NoPosts />}
                  </div>
                ),
              },
              exclamation: {
                hidden: true,
                onClick: () => {},
                panel: <div className={'w-1/2'}>Not needed on community page</div>,
              },
              gas: {
                hidden: false,
                onClick: () => {},
                panel: (
                  <div className={'flex w-1/2'}>
                    <ReputationCard />

                  </div>
                ),
              },
            }}
          />
        </CommunityCardContext.Provider>

        {children}
      </div>
    </div>
  )
}
import { motion, AnimatePresence } from 'framer-motion'


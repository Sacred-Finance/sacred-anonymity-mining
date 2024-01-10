import type { Dispatch, SetStateAction } from 'react'
import React, { useState } from 'react'
import { Post } from '@/lib/post'
import { useActiveUser, useCommunityContext, useUsers } from '@/contexts/CommunityProvider'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import type { SortByOption } from '@components/SortBy'
import SortBy from '@components/SortBy'
import type { User } from '@/lib/model'
import { ContentType } from '@/lib/model'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { toast } from 'react-toastify'
import { useItemsSortedByVote } from '@/hooks/useItemsSortedByVote'
import type { NewPostFormProps } from '@components/NewPostForm'
import { NewPostForm } from '@components/NewPostForm'
import { PostList } from '@components/Post/PostList'
import type { Group, Item } from '@/types/contract/ForumInterface'
import CreatePollUI from './CreatePollUI'
import { useContentManagement } from '@/hooks/useContentManagement'
import { NewPostModal } from '@components/Post/PostComments'
import LoadingComponent from '@components/LoadingComponent'
import { CommunityCard } from './CommunityCard/CommunityCard'
import { GroupPostAPI } from '@/lib/fetcher'
import { useSWRConfig } from 'swr'
import { ShowConnectIfNotConnected } from '@components/Connect/ConnectWallet'
import { useUserIfJoined } from '@/contexts/UseUserIfJoined'

export function CommunityPage({
  community,
  posts,
  refreshData,
}: {
  community: Group
  posts?: Item[]
  refreshData?: () => void
}) {
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
      <div className="relative flex min-h-screen gap-6 rounded-lg  p-6 transition-colors ">
        <div className="sticky top-0 flex w-full flex-col gap-6">
          <CommunityCard variant="banner" community={community} isAdmin={isAdmin} />

          <div className="flex w-fit gap-4 rounded-lg ">
            <ShowConnectIfNotConnected>
              <CreatePollUI group={community} onSuccess={refreshData} />
              <CreatePostUI group={community} />
            </ShowConnectIfNotConnected>
          </div>
          <SortBy onSortChange={setSortBy} />
          <PostList posts={sortedData} group={community} refreshData={refreshData} />
        </div>
      </div>
    </div>
  )
}

const CreatePostUI = ({ group }: { group: Group }) => {
  const groupId = group.groupId
  const user = useUserIfJoined(group.id.toString())
  const activeUser = useActiveUser()
  const { t } = useTranslation()
  const { address } = useAccount()
  const { checkUserBalance } = useValidateUserBalance(group, address)
  const users = useUsers()
  const { mutate } = useSWRConfig()
  const postInstance = group && new Post(undefined, group.id.toString())

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

  const { contentDescription, setContentDescription, contentTitle, setContentTitle, clearContent } =
    useContentManagement({
      isPostOrPoll: true,
      defaultContentDescription: undefined,
      defaultContentTitle: undefined,
    })

  const addPost: () => Promise<void> = async () => {
    if (validateRequirements() !== true) {
      return
    }

    if (!contentTitle || !contentDescription) {
      console.log('Please enter a title and description')
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

    try {
      if (postInstance === undefined) {
        return
      }

      const tempCache: Item = {
        title: contentTitle,
        description: contentDescription,
        kind: ContentType.POST,
        parentId: '0',
        groupId: groupId as string,
        childIds: [],
        upvote: 0,
        downvote: 0,
        isMutating: true,
      }

      mutate(
        GroupPostAPI(groupId as string),
        async (data: any) => {
          try {
            const response = await postInstance?.create({
              postContent: {
                title: contentTitle as string,
                description: contentDescription,
              },
              address: address,
              users: users,
              postedByUser: activeUser as User,
              groupId: groupId as string,
              setWaiting: setIsLoading,
              onIPFSUploadSuccess: post => {
                console.log('post', post)
                const element = document.getElementById(`new_post`)
                element?.scrollIntoView({ behavior: 'smooth' })
              },
            })
            if (response?.status === 200) {
              setIsLoading(false)
              clearContent()
              console.log('post created successfully')
              console.log('response', response)
              const { args } = response.data
              const lastPost = {
                ...tempCache,
                id: +args[2]?.hex,
                note: args[5]?.hex?.toString(),
                isMutating: false,
              }

              /** Must mutate the posts to notify useEffect in parent */
              return { ...data, posts: [...data.posts, lastPost] }
            } else {
              console.log('error', response)
              setIsLoading(false)
            }
            return data
          } catch (error) {
            console.log('error', error)
            toast.error('Failed to create post')
            setIsLoading(false)
            return data
          }
        },
        {
          optimisticData: (data: any) => {
            if (data) {
              return {
                ...data,
                posts: [...data.posts, tempCache],
              }
            }
          },
          rollbackOnError: true,
          revalidate: false,
        }
      )
    } catch (error) {
      console.log('error', error)
      setIsLoading(false)
    }
  }

  const propsForNewPost: NewPostFormProps = {
    editorId: `${groupId}_post`,
    submitButtonText: t('button.submit') as string,
    openFormButtonText: t('button.newPost') as string,
    description: contentDescription,
    setDescription: setContentDescription,
    handleSubmit: addPost,
    showButtonWhenFormOpen: false,
    setTitle: setContentTitle as Dispatch<SetStateAction<string | null>>,
    resetForm: () => {},
    isReadOnly: false,
    isSubmitting: isLoading,
    title: contentTitle as string,
    isEditable: true,
    itemType: 'post',
    actionType: 'new',
    classes: NewPostModal,
  }

  return <NewPostForm {...propsForNewPost} />
}

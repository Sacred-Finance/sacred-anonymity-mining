import React, { Dispatch, SetStateAction, useRef, useState } from 'react'
import { Post } from '@/lib/post'
import { useActiveUser, useUserIfJoined, useUsers } from '@/contexts/CommunityProvider'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import { SortByOption } from '@components/SortBy'
import { useUnirepSignUp } from '@/hooks/useUnirepSignup'
import { User } from '@/lib/model'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { toast } from 'react-toastify'
import { useItemsSortedByVote } from '@/hooks/useItemsSortedByVote'
import { NewPostForm, NewPostFormProps } from '@components/NewPostForm'
import { PostList } from '@components/Post/PostList'
import { Group, Item } from '@/types/contract/ForumInterface'
import CreatePollUI from './CreatePollUI'
import { useContentManagement } from '@/hooks/useContentManagement'
import { CommunityCard } from '@components/CommunityCard/CommunityCard'
import { NewPostModal } from '@components/Post/PostComments'

export function CommunityPage({ community, posts }: { community: Group; posts?: Item[] }) {
  const groupId = community.id.toString()
  const user = useUserIfJoined(groupId as string)
  useUnirepSignUp({ groupId: groupId, name: (user as User)?.name })

  const [sortBy, setSortBy] = useState<SortByOption>('highest')

  const sortedData = useItemsSortedByVote([], posts, sortBy)

  return (
    <div className="relative mt-6 flex min-h-screen gap-6 rounded-lg  p-6 transition-colors dark:bg-gray-800">
      <div className="sticky top-0 flex w-full flex-col gap-6">
        <div className="max-w-[450px]">
          <CommunityCard community={community} isAdmin={false} variant={'banner'} />
        </div>
        <div className="flex w-fit gap-4 rounded-lg bg-gray-200 p-4 dark:bg-gray-900">
          <CreatePollUI group={community} />
          <CreatePostUI group={community} />
        </div>
        <PostList posts={sortedData} />
      </div>
    </div>
  )
}

const CreatePostUI = ({ group }: { group: Group }) => {
  const groupId = group.groupId
  const user = useUserIfJoined(group.id.toString())
  const activeUser = useActiveUser({ groupId: group.id.toString() })
  const { t } = useTranslation()
  const { address } = useAccount()
  const { checkUserBalance } = useValidateUserBalance(group, address)
  const users = useUsers()
  const postInstance = group && new Post(undefined, group.id.toString())

  const [isLoading, setIsLoading] = useState(false)

  const validateRequirements = () => {
    if (!address) return toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })
    if (!user) return toast.error(t('toast.error.notJoined'), { type: 'error', toastId: 'min' })

    return true
  }

  const { contentDescription, setContentDescription, tempContents, contentTitle, setTempContents, setContentTitle } =
    useContentManagement({
      isPost: true,
      defaultContentDescription: undefined,
      defaultContentTitle: undefined,
    })

  const addPost: () => Promise<void> = async () => {
    if (validateRequirements() !== true) return

    if (!contentTitle || !contentDescription) {
      console.log('Please enter a title and description')
      toast.error('Please enter a title and description', { toastId: 'missingTitleOrDesc' })
      return
    }


    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return

    setIsLoading(true)

    try {
      const { status } = await postInstance?.create({
        postContent: {
          title: contentTitle,
          description: contentDescription,
        },
        address: address,
        users: users,
        postedByUser: activeUser as User,
        groupId: groupId as string,
        setWaiting: setIsLoading,
        onIPFSUploadSuccess: (post, cid) => {
          toast.success('content stored correctly')
        },
      })

      if (status === 200) {
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    } catch (error) {
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
    showButtonWhenFormOpen: true,
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

import React, { useRef, useState } from 'react'
import { Post } from '@/lib/post'
import { useActiveUser, useUserIfJoined, useUsers } from '@/contexts/CommunityProvider'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import { SortByOption } from '@components/SortBy'
import { useUnirepSignUp } from '@/hooks/useUnirepSignup'
import { User } from '@/lib/model'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { useLoaderContext } from '@/contexts/LoaderContext'
import { toast } from 'react-toastify'
import { useItemsSortedByVote } from '@/hooks/useItemsSortedByVote'
import clsx from 'clsx'
import { NewPostForm } from '@components/NewPostForm'
import { PostList } from '@components/Post/PostList'
import { Group, Item } from '@/types/contract/ForumInterface'
import CreatePollUI from './CreatePollUI'
import { useContentManagement } from '@/hooks/useContentManagement'
import { CommunityCard } from '@components/CommunityCard/CommunityCard'

export function CommunityPage({
  children,
  postInstance,
  community,
  posts,
  post,
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
  useUnirepSignUp({ groupId: groupId, name: (user as User)?.name })
  const activeUser = useActiveUser({ groupId })
  const { address } = useAccount()
  const users = useUsers()
  const { t } = useTranslation()

  const [sortBy, setSortBy] = useState<SortByOption>('highest')

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
      }
    } catch (error) {
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

  const propsForNewPost = {
    editorId: `${groupId}_post`,
    submitButtonText: t('button.submit') as string,
    openFormButtonText: t('button.newPost') as string,
    description: contentDescription,
    setDescription: setContentDescription,
    handleSubmit: addPost,
    editorReference: postEditorRef,
    showButtonWhenFormOpen: true,
    setTitle: setContentTitle,
    resetForm: () => clearInput(true),
    isReadOnly: false,
    isSubmitting: isContextLoading,
    title: contentTitle as string,
    isEditable: true,
    itemType: 'post',
    actionType: 'new',
    classes: {
      rootClosed: '!w-fit !p-0',
      rootOpen: 'fixed z-50 inset-0 p-12 bg-gray-900/50 flex justify-center items-center ',
      formBody: 'w-full h-full flex flex-col gap-4 min-h-[400px] justify-between ',
      editor:
        'border rounded-md py-2 px-3  transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 dark:text-dark-100',
      submitButton:
        'bg-green-500 text-white border-none rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600',
      formContainerOpen:
        'bg-white dark:bg-gray-900 p-6 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg w-full max-w-3xl overflow-y-auto ',
      openFormButtonOpen: 'self-end hidden',
      openFormButtonClosed:
        'h-full bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600',
    },
  }

  return (
    <div className="relative mt-6 flex min-h-screen gap-6 rounded-lg  p-6 transition-colors dark:bg-gray-800">
      <div className="sticky top-0 flex w-full flex-col gap-6">
        <div className="max-w-[450px]">
          <CommunityCard community={community} isAdmin={false} variant={'banner'} />
        </div>
        <div className="flex w-fit gap-4 rounded-lg bg-gray-200 p-4 dark:bg-gray-900">
          <CreatePollUI groupId={groupId} />
          <NewPostForm {...propsForNewPost} />
        </div>
          <PostList posts={sortedData} />
          <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}

export const PostNavigator = ({ posts, visiblePostIds, scrollIntoView }) => {
  return (
    <div className="sticky top-24 flex flex-col gap-4 rounded  p-4">
      <h2 className="mb-2 text-base font-bold">Posts</h2>
      <ul className="flex flex-col gap-2">
        {posts.map(post => (
          <li key={post.id}>
            <button
              onClick={() => scrollIntoView(post.id)}
              className={clsx(
                'text-left text-sm font-bold transition-colors hover:cursor-pointer',
                visiblePostIds.includes(post.id) ? 'text-primary-600' : 'text-gray-600'
              )}
            >
              {post.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

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
import { CommunityBanner, CommunityLogo } from '@components/CommunityCard/CommunityCardHeader'
import { CommunityCardContext } from '@components/CommunityCard/CommunityCard'
import EditGroupNavigationButton, { useCheckIsOwner } from '@components/EditGroupNavigationButton'
import { Avatar } from '@components/Avatar'
import Image from 'next/image'
import { useValidatedImage } from '@components/CommunityCard/UseValidatedImage'

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

  const bannerSrc = useValidatedImage(community?.groupDetails?.bannerCID)

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
      rootOpen: 'fixed z-50 inset-0 p-12 bg-gray-900 bg-opacity-50 flex justify-center items-center',
      formBody: 'w-full h-full flex flex-col gap-4',
      editor: 'border rounded py-1 px-2 bg-white',
      submitButton: 'bg-green-500 text-white border-none rounded',
      formContainerOpen: 'bg-white p-4 border border-gray-300 rounded shadow-lg w-full max-w-3xl',
      openFormButtonOpen: 'self-end bg-primary-500 text-white hidden',
    },
  }

  return (
    <CommunityCardContext.Provider value={community}>
      <div className="flex w-full items-center bg-white p-4">
        {/* Community Logo */}
        <div className="relative h-24 w-24 flex-shrink-0">
          <CommunityLogo />
        </div>

        {/* Community Name & Description */}
        <div className="ml-6 flex flex-grow flex-col justify-center">
          <h1 className="text-4xl font-semibold">{community.name}</h1>
          <p className="mt-2 text-gray-600">{community.groupDetails.description}</p>
        </div>

        {/* Community Banner */}
        <div className="relative ml-6 w-1/2 flex-shrink-0">
          <Image
            className={clsx(
              'rounded-md shadow transition-shadow duration-300 ease-in-out hover:shadow-lg',
              'border border-gray-300 hover:border-opacity-50 hover:ring-2 hover:ring-gray-300 hover:ring-opacity-60'
            )}
            src={bannerSrc}
            alt="community Banner Image"
            width={1000}
            height={1000}
            unoptimized
            priority
          />
        </div>
      </div>

      <div className={clsx('h-fit min-h-screen !text-gray-900 ')}>
        <div className={'group relative flex flex-col'}>
          <CommunityActionTabs
            defaultTab={'chat'}
            tabs={{
              chat: {
                hidden: false,
                onClick: () => {},
                panel: (
                  <>
                    <div className="flex w-full gap-2 ">
                      <EditGroupNavigationButton community={community} />
                      <CreatePollUI groupId={groupId} />
                      <NewPostForm {...propsForNewPost} />
                      <SortBy onSortChange={handleSortChange} targetType="posts" />
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                      <PostList posts={sortedData} />

                    </div>
                  </>
                ),
              },
              community: {
                hidden: true,
                onClick: () => {},
                panel: <div className={'w-1/2'}>Not needed on community page</div>,
              },
              gas: {
                hidden: true,
                onClick: () => {},
                panel: (
                  <div className={'flex w-1/2'}>
                    <ReputationCard />
                  </div>
                ),
              },
            }}
          />

          {children}
        </div>
      </div>
    </CommunityCardContext.Provider>
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

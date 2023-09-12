import React, { useRef, useState } from 'react'
import { Post } from '@/lib/post'
import { useActiveUser, useUserIfJoined, useUsers } from '@/contexts/CommunityProvider'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import { OutputData } from '@editorjs/editorjs'
import { SortByOption } from '@components/SortBy'
import { useUnirepSignUp } from '@/hooks/useUnirepSignup'
import { User } from '@/lib/model'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { useLoaderContext } from '@/contexts/LoaderContext'
import { toast } from 'react-toastify'
import { useItemsSortedByVote } from '@/hooks/useItemsSortedByVote'
import clsx from 'clsx'
import { NewPostForm } from '@components/NewPostForm'
import { PostItem, PostList } from '@components/postList'
import { NoPosts } from '@components/NoPosts'
import { Group, Item } from '@/types/contract/ForumInterface'
import { CommunityCard } from '@components/CommunityCard/CommunityCard'
import CreatePollUI from './CreatePollUI'
import ReputationCard from '@components/ReputationCard'

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

  const [postDescription, setPostDescription] = useState<OutputData>(null)
  const [postTitle, setPostTitle] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortByOption>('highest')
  const [tempPosts, setTempPosts] = useState([])

  const { checkUserBalance } = useValidateUserBalance(community, address)
  const { setIsLoading, isLoading: isContextLoading } = useLoaderContext()
  const postEditorRef = useRef<any>()

  const validateRequirements = () => {
    if (!address) return toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })
    if (!user) return toast.error(t('toast.error.notJoined'), { type: 'error', toastId: 'min' })

    return true
  }

  const addPost: () => Promise<void> = async () => {
    if (validateRequirements() !== true) return

    if (!postTitle || !postDescription) {
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
          title: postTitle,
          description: postDescription,
        },
        address,
        users,
        activeUser,
        groupId as string,
        setIsLoading,
        (post, cid) => {
          ipfsHash = cid
          setTempPosts([
            {
              id: cid,
              ...post,
            },
            ...tempPosts,
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
      setTempPosts(prevPosts => {
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

  const sortedData = useItemsSortedByVote(tempPosts, posts, sortBy)

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
      setPostTitle(post?.title)
      setPostDescription(post?.description)
      return
    } else {
      setPostTitle('')
      setPostDescription(null)
      postEditorRef?.current?.clear?.()
    }
  }

  function renderItemList() {
    if (post) {
      return <PostItem post={post} voteForPost={voteForPost} />
    } else if (sortedData?.length > 0) {
      return <PostList posts={sortedData} voteForPost={voteForPost} handleSortChange={handleSortChange} showFilter />
    } else {
      return (
        <div className="rounded-lg bg-white/10 p-6 shadow-lg">
          <NoPosts />
        </div>
      )
    }
  }

  return (
    <div className={clsx('mx-auto w-full max-w-screen-2xl space-y-12 !text-gray-900 sm:p-8 md:p-24')}>
      <CommunityCard community={community} index={0} isAdmin={false} variant={'banner'} />
      <ReputationCard />
      <div className={'flex items-center gap-3'}>
        <CreatePollUI groupId={groupId} />
        <NewPostForm
          editorId={`${groupId}_post`}
          submitButtonText={t('button.submit') as string}
          openFormButtonText={t('button.newPost') as string}
          description={postDescription}
          setDescription={setPostDescription}
          handleSubmit={addPost}
          editorReference={postEditorRef}
          setTitle={setPostTitle}
          resetForm={() => clearInput(true)}
          isReadOnly={false}
          isSubmitting={isContextLoading}
          title={postTitle as string}
          isEditable={true}
          itemType={'post'}
          handlerType={'new'}
          classes={{
            rootClosed: '!w-fit !m-0 !p-0',
          }}
          formVariant={'default'}
        />
      </div>

      {!postId && renderItemList()}

      {children}
    </div>
  )
}

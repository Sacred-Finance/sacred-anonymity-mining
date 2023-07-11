import React, { useEffect, useRef, useState } from 'react'
import { Post } from '@/lib/post'
import { useActiveUser, useCommunityById, useUserIfJoined, useUsers } from '@/contexts/CommunityProvider'
import { useCommunityUpdates } from '@/hooks/useCommunityUpdates'
import { useAccount, useContract, useProvider } from 'wagmi'
import { useTranslation } from 'react-i18next'
import { OutputData } from '@editorjs/editorjs'
import { SortByOption } from '@components/SortBy'
import { polygonMumbai } from 'wagmi/chains'
import { ForumContractAddress } from '@/constant/const'
import ForumABI from '@/constant/abi/Forum.json'
import { useUnirepSignUp } from '@/hooks/useUnirepSignup'
import { User } from '@/lib/model'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { useLoaderContext } from '@/contexts/LoaderContext'
import useSWR from 'swr'
import { toast } from 'react-toastify'
import { useSortedVotes } from '@/hooks/useSortedVotes'
import clsx from 'clsx'
import { JoinCommunityButton } from '@components/JoinCommunityButton'
import { NewPostForm } from '@components/NewPostForm'
import ReputationCard from '@components/ReputationCard'
import { PostList } from '@components/postList'
import { NoPosts } from '@components/NoPosts'

export function CommunityPage({
  children,
  groupId,
  postId,
  postInstance,
}: {
  children?: React.ReactNode
  groupId: string
  postId: string | undefined
  postInstance: Post
}) {
  const user = useUserIfJoined(groupId as string)
  useCommunityUpdates({ postInstance })
  const activeUser = useActiveUser({ groupId })
  const { address } = useAccount()
  const users = useUsers()
  const { t } = useTranslation()

  const [postDescription, setPostDescription] = useState<OutputData>(null)
  const [postTitle, setPostTitle] = useState('')
  const [sortBy, setSortBy] = useState<SortByOption>('highest')
  const [tempPosts, setTempPosts] = useState([])

  const provider = useProvider({ chainId: polygonMumbai.id })
  const forumContract = useContract({
    address: ForumContractAddress,
    abi: ForumABI.abi,
    signerOrProvider: provider,
  })

  const community = useCommunityById(groupId as string)
  const unirepUser = useUnirepSignUp({ groupId: groupId, name: (user as User)?.name })

  const { checkUserBalance } = useValidateUserBalance(community, address)
  const { setIsLoading, isLoading: isContextLoading } = useLoaderContext()
  const postEditorRef = useRef<any>()
  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    ;(async () => {
      if (!forumContract || !provider || initialized) return
      setInitialized(true)
      setIsLoading(false)
    })()
  }, [forumContract, groupId, provider])

  const { data, isLoading } = useSWR(`${groupId}_group`, postId ? fetchPost : fetchPosts)

  async function fetchPosts() {
    console.log('fetching posts')
    return await postInstance.getAll()
  }

  async function fetchPost() {
    console.log('fetching post')
    return [await postInstance.get()]
  }

  const validateRequirements = () => {
    if (!address) return toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })
    if (!user) return toast.error(t('toast.error.notJoined'), { type: 'error', toastId: 'min' })

    return true
  }

  const addPost = async () => {
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
        // toast({
        console.log(`Your greeting was posted 🎉`)
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

  const sortedData = useSortedVotes(tempPosts, data, sortBy)

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
        postInstance?.updatePostsVote(postInstance, postId, voteType, false).then(() => setIsLoading(false))
        const response = await postInstance?.vote(voteType, address, users, activeUser, postId, groupId)
        consol.log('response', response)
        const { status } = response

        if (status === 200) {
          setIsLoading(false)
          toast.success(t('toast.success.vote'), { toastId: 'vote' })
        }
      } catch (error) {
        postInstance?.updatePostsVote(postInstance, postId, voteType, true, true)
        setIsLoading(false)
        toast.error(t('toast.error.vote'), { toastId: 'vote' })
      }
    },
    [user, address, groupId, users, activeUser]
  )

  const clearInput = () => {
    setPostDescription(null)
    setPostTitle('')
    postEditorRef?.current?.clear?.()
  }

  if (isLoading) return null
  const sortedAndFilteredData = sortedData.filter(post => post?.id === postId)
  return (
    <div className={clsx('mx-auto h-screen w-full max-w-screen-xl space-y-12 overflow-y-auto sm:p-8 md:p-24')}>
      <div
        className="relative flex min-h-[200px] items-center justify-between rounded-lg bg-white/10 p-6 shadow-lg"
        style={{
          backgroundImage: community?.banner ? `url(https://ipfs.io/ipfs/${community?.banner})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <img
          className="absolute bottom-0 left-1/2 h-20 w-20 -translate-x-1/2 translate-y-1/2 transform rounded-full border-2 border-white object-cover"
          src={`https://ipfs.io/ipfs/${community?.logo}`}
          alt="community logo"
        />
        <div className="flex flex-col items-center rounded bg-white bg-opacity-50 p-4">
          <h1 className="text-2xl font-bold text-black">{community?.name}</h1>
        </div>


        {!(user as User)?.identityCommitment && community && <JoinCommunityButton community={community} />}
        <ReputationCard unirepUser={unirepUser} />

      </div>

      {isNaN(postId) && (
        <NewPostForm
          id={groupId}
          postEditorRef={postEditorRef}
          postTitle={postTitle}
          setPostTitle={setPostTitle}
          postDescription={postDescription}
          setPostDescription={setPostDescription}
          readOnly={isLoading || !community?.name || isContextLoading}
          isLoading={isLoading || !community?.name || isContextLoading}
          clearInput={clearInput}
          addPost={addPost}
        />
      )}


      <div className="rounded-lg bg-white/10 p-6">
        {!isNaN(postId) && sortedData.length ? (
          <>
            <PostList
              posts={sortedAndFilteredData}
              // data={data}
              voteForPost={voteForPost}
              handleSortChange={handleSortChange}
            />
          </>
        ) : sortedData?.length > 0 ? (
          <PostList
            posts={sortedData}
            // data={data}
            voteForPost={voteForPost}
            handleSortChange={handleSortChange}
          />
        ) : (
          <div className="rounded-lg bg-white/10 p-6 shadow-lg">
            <NoPosts />
          </div>
        )}
      </div>

      {children}
    </div>
  )
}

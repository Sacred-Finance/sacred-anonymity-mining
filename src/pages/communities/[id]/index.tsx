import { ethers } from 'ethers'
import React, { useEffect, useRef, useState } from 'react'
import { useAccount, useContract, useProvider } from 'wagmi'
import { Post } from '../../../lib/post'

import { OutputData } from '@editorjs/editorjs'
import useSWR from 'swr'
import { useLoaderContext } from '../../../contexts/LoaderContext'
import { NoPosts } from '../../../components/NoPosts'
import { SortByOption } from '../../../components/SortBy'
import { useValidateUserBalance } from '../../../utils/useValidateUserBalance'
import { useTranslation } from 'react-i18next'
import { useSortedVotes } from '../../../hooks/useSortedVotes'
import { JoinCommunityButton } from '../../../components/JoinCommunityButton'
import { useRouter } from 'next/router'
import { useActiveUser, useCommunityById, useUserIfJoined, useUsers } from '../../../contexts/CommunityProvider'
import { polygonMumbai } from 'wagmi/chains'
import { ForumContractAddress } from '../../../constant/const'
import ForumABI from '../../../constant/abi/Forum.json'
import { useCommunityUpdates } from '../../../hooks/useCommunityUpdates'
import { useCreateCommunity } from '../../../hooks/useCreateCommunity'
import { CustomModal } from '../../../components/CustomModal'

import CreateGroupFormUI from '../../../components/CreateGroupFormUI'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { toast } from 'react-toastify'
import { PostList } from '../../../components/postList'
import { NewPostForm } from '../../../components/NewPostForm'
import { User } from '@/lib/model'
import { useUnirepSignUp } from '../../../hooks/useUnirepSignup'

export function Main() {
  const activeUser = useActiveUser()
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
  const router = useRouter()
  const { id, postId } = router.query
  const user = useUserIfJoined(id as string)
  const postInstance = useRef<Post>(null)

  // Only update postInstance if id changes
  useEffect(() => {
    postInstance.current = new Post(null, id)
  }, [id])
  const community = useCommunityById(id as string)
  useCommunityUpdates({ user, postInstance })
  useUnirepSignUp({ groupId: id, name: (user as User)?.name })

  const { checkUserBalance } = useValidateUserBalance(community, address)
  const { setIsLoading, isLoading: isContextLoading } = useLoaderContext()
  const postEditorRef = useRef<any>()
  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    ;(async () => {
      if (!forumContract || !provider || initialized) return
      setInitialized(true)
      setIsLoading(false)
      // preload(postInstance.groupCacheId(), fetchPosts);//start fetching before render
    })()
  }, [forumContract, id, provider])

  const { data, isLoading } = useSWR(`${id}_group`, fetchPosts)

  async function fetchPosts() {
    console.log('fetching posts')
    return await postInstance.current.getAll()
  }

  const addPost = async () => {
    if (!address) {
      console.log('Please connect your wallet')
      toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })
      return
    }
    if (!postTitle || !postDescription) {
      console.log('Please enter a title and description')
      toast.error('Please enter a title and description', { toastId: 'missingTitleOrDesc' })
      return
    }

    if (!user) {
      console.log('Please join the community first')
      toast.error('Please join the community first', { toastId: 'joinCommunityFirst' })
      return
    }
    let ipfsHash

    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return

    setIsLoading(true)

    try {
      const { status } = await postInstance.current.create(
        {
          title: postTitle,
          description: postDescription,
        },
        address,
        users,
        activeUser,
        id as string,
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

  const voteForPost = async (postId, voteType: 0 | 1) => {
    if (!user) return
    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return
    setIsLoading(true)

    try {
      postInstance?.current?.updatePostsVote(postInstance, postId, voteType, false).then(() => setIsLoading(false))
      const { status } = await postInstance?.current?.vote(voteType, address, users, activeUser, postId, id)

      if (status === 200) {
        setIsLoading(false)
      }
    } catch (error) {
      postInstance?.current?.updatePostsVote(postInstance, postId, voteType, true, true)
      setIsLoading(false)
    }
  }

  const clearInput = () => {
    setPostDescription(null)
    setPostTitle('')
    postEditorRef?.current?.clear?.()
  }

  if (isLoading) return null
  return (
    <div className="mx-auto mb-32 h-screen w-full max-w-screen-xl space-y-12 sm:p-8 md:p-24">
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
          {/*<h1 className="text-sm font-semibold text-gray-700">{community?.description}</h1>*/}
        </div>
        {!(user as User)?.identityCommitment && community && <JoinCommunityButton community={community} />}
      </div>

      {!postId && (
        <NewPostForm
          id={id}
          postEditorRef={postEditorRef}
          postTitle={postTitle}
          setPostTitle={setPostTitle}
          postDescription={postDescription}
          setPostDescription={setPostDescription}
          isLoading={isLoading || !community?.name || isContextLoading}
          clearInput={clearInput}
          addPost={addPost}
        />
      )}

      {postId ? (
        <PostList
          posts={[sortedData?.find(post => post.id === postId)]}
          isLoading={isLoading}
          data={data}
          voteForPost={voteForPost}
          handleSortChange={handleSortChange}
        />
      ) : sortedData?.length > 0 ? (
        <div className="rounded-lg bg-white/10 p-6 shadow-lg">
          <PostList
            posts={sortedData}
            isLoading={isLoading}
            data={data}
            voteForPost={voteForPost}
            handleSortChange={handleSortChange}
          />
        </div>
      ) : (
        <div className="rounded-lg bg-white/10 p-6 shadow-lg">
          <NoPosts />
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [createCommunityModalOpen, setCreateCommunityModalOpen] = useState(false)
  const createCommunity = useCreateCommunity(() => setCreateCommunityModalOpen(false))

  return (
    <div className={'flex h-screen flex-col'}>
      <Header createCommunity={() => setCreateCommunityModalOpen(true)} />

      <CustomModal isOpen={createCommunityModalOpen} setIsOpen={setCreateCommunityModalOpen}>
        <CreateGroupFormUI onCreate={createCommunity} onCreateGroupClose={() => setCreateCommunityModalOpen(false)} />
      </CustomModal>
      <div>
        <Main />
      </div>
      <div className={'flex-1'} />
      <Footer />
    </div>
  )
}

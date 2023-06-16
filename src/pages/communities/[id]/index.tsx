import { ethers } from 'ethers'
import React, { useEffect, useRef, useState } from 'react'
import { useAccount, useContract, useProvider } from 'wagmi'
import { Post } from '../../../lib/post'

import { OutputData } from '@editorjs/editorjs'
import useSWR from 'swr'
import { useLoaderContext } from '../../../contexts/LoaderContext'
import { NoPosts } from '../../../components/NoPosts'
import SortBy, { SortByOption } from '../../../components/SortBy'
import { useValidateUserBalance } from '../../../utils/useValidateUserBalance'
import { CancelButton, PrimaryButton, VoteDownButton, VoteUpButton } from '../../../components/buttons'
import { useTranslation } from 'react-i18next'
import { useSortedVotes } from '../../../hooks/useSortedVotes'
import { JoinCommunityButton } from '../../../components/JoinCommunityButton'
import { formatDistanceToNow } from '../../../lib/utils'
import { useRouter } from 'next/router'
import { useActiveUser, useCommunityById, useHasUserJoined, useUsers } from '../../../contexts/CommunityProvider'
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
import dynamic from 'next/dynamic'
import { useUnirepSignUp } from '../../../hooks/useUnirepSignup'

const Editor = dynamic(() => import('../../../components/editor-js/Editor'), {
  ssr: false,
})

interface CommunityProps {
  forumContract: ethers.Contract
  users: any[]
  provider: ethers.providers.BaseProvider
}

let postInstance: Post = null

export function Main() {
  const activeUser = useActiveUser()
  const { address } = useAccount()
  const users = useUsers()

  const [postDescription, setPostDescription] = useState<OutputData>(null)
  const [postTitle, setPostTitle] = useState('')
  const [sortBy, setSortBy] = useState<SortByOption>('highest')
  const [groupCacheId, setGroupCacheId] = useState<string | null>(null)
  const [tempPosts, setTempPosts] = useState([])

  const provider = useProvider({ chainId: polygonMumbai.id })
  const forumContract = useContract({
    address: ForumContractAddress,
    abi: ForumABI.abi,
    signerOrProvider: provider,
  })
  const router = useRouter()
  const id = router.query.id
  const hasUserJoined = useHasUserJoined(id as string)
  const community = useCommunityById(id as string)
  useCommunityUpdates({ hasUserJoined, id, groupCacheId, postInstance })
  useUnirepSignUp({ groupId: id, name: hasUserJoined?.name })
  const { checkUserBalance } = useValidateUserBalance(community, address, provider)
  const { setIsLoading, isLoading: isContextLoading } = useLoaderContext()
  const postEditorRef = useRef<any>()

  useEffect(() => {
    ;(async () => {
      postInstance = new Post(null, id, forumContract, provider)
      setGroupCacheId(postInstance.groupCacheId())
      // preload(postInstance.groupCacheId(), fetchPosts);//start fetching before render
    })()
  }, [forumContract])

  const { data, isLoading } = useSWR(groupCacheId, fetchPosts, {
    revalidateOnFocus: false,
  })

  async function fetchPosts() {
    return await postInstance.getAll()
  }

  const addPost = async () => {
    if (!address) {
      console.log('Please connect your wallet')
      toast.error('Please connect your wallet')
      return
    }
    if (!postTitle || !postDescription) {
      console.log('Please enter a title and description')
      toast.error('Please enter a title and description')
      // toast({
      return
    }

    if (!hasUserJoined) {
      console.log('Please join the community first')
      toast.error('Please join the community first')
      return
    }
    let ipfsHash

    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return

    setIsLoading(true)

    try {
      //@ts-ignore
      const { status } = await postInstance.create(
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

  console.log('sortedData', sortedData)

  const voteForPost = async (postId, voteType: 0 | 1) => {
    if (!hasUserJoined) return
    const hasSufficientBalance = await checkUserBalance()
    if (!hasSufficientBalance) return
    setIsLoading(true)

    try {
      postInstance.updatePostsVote(postInstance, postId, voteType, false).then(() => setIsLoading(false))
      const { status } = await postInstance.vote(voteType, address, users, activeUser, postId, id)

      if (status === 200) {
        // toast({
        setIsLoading(false)
      }
    } catch (error) {
      // toast({
      postInstance.updatePostsVote(postInstance, postId, voteType, true, true)
      setIsLoading(false)
    }
  }

  const communityHasBanner = React.useMemo(() => {
    return !!community?.banner
  }, [community?.banner])

  const clearInput = () => {
    setPostDescription(null)
    setPostTitle('')
    postEditorRef?.current?.clear()
  }

  if (isLoading) return null

  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-12 p-24  md:px-0">
      <div className="flex items-center justify-between">
        <img
          className="h-20 w-20 rounded-full border-2 border-indigo-500 object-cover"
          src={`https://ipfs.io/ipfs/${community?.logo}`}
          alt="community logo"
        />
        <SortBy onSortChange={handleSortChange} targetType="posts" />
        {!hasUserJoined?.identityCommitment && community && <JoinCommunityButton community={community} />}
      </div>

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

      {sortedData?.length > 0 ? (
        <PostList posts={sortedData} isLoading={isLoading} data={data} voteForPost={voteForPost} />
      ) : (
        <NoPosts />
      )}
    </div>
  )
}

const NewPostForm = ({
  id,
  postEditorRef,
  postTitle,
  setPostTitle,
  postDescription,
  setPostDescription,
  isLoading,
  clearInput,
  addPost,
}) => {
  const { t } = useTranslation()

  const [open, setOpen] = React.useState(false)

  return (
    <div className="mt-6">
      <button onClick={() => setOpen(true)} className="rounded-lg bg-indigo-500 px-6 py-2 text-white">
        {t('newPost')}
      </button>
      <CancelButton
        onClick={() => {
          setOpen(false)
          clearInput()
        }}
        className="ml-4 rounded-lg bg-red-500 px-6 py-2 text-white"
      >
        {t('button.cancel')}
      </CancelButton>
      &nbsp;
      <PrimaryButton
        onClick={addPost}
        // disabled={!postTitle && !postDescription?.blocks?.length}
        className="ml-4 rounded-lg bg-green-500 px-6 py-2 text-white"
      >
        {isLoading ? <>loading</> : t('button.post')}
      </PrimaryButton>
      <div className="mt-4 text-xl font-bold">{t('newPost')}</div>
      <>
        <input
          className="mt-2 w-full rounded border-2 border-gray-200 p-3"
          placeholder={t('placeholder.enterPostTitle')}
          value={postTitle}
          onChange={e => setPostTitle(e.target.value)}
        />

        <Editor
          holder={id}
          //@ts-ignore
          ref={postEditorRef}
          data={postDescription}
          onChange={val => setPostDescription(val)}
          placeholder={t('placeholder.enterPostContent')}
          // className="w-full border-2 border-gray-200 p-3 rounded mt-2"
        />
      </>
    </div>
  )
}

const PostList = ({ posts, isLoading, data, voteForPost }) => (
  <div className="mt-6 space-y-4">
    {posts.map((p, i) => (
      <PostItem post={p} index={i} key={i} voteForPost={voteForPost} isLoading={isLoading} data={data} />
    ))}
  </div>
)

const PostItem = ({
  isLoading,
  voteForPost,
  data,
  post: { comments, createdAt, downvote, id, likes, title, upvote, views },
  index,
}) => {
  return (
    <div className="flex items-start space-x-4 rounded-lg border-2 border-gray-200 p-4">
      <div className="flex w-full flex-col space-y-2">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="flex items-center space-x-4">
            <VoteUpButton onClick={() => voteForPost(id, 1)} disabled={isLoading} />
            <span className="text-gray-500">{upvote}</span>
            <VoteDownButton onClick={() => voteForPost(id, 0)} disabled={isLoading} />
            <span className="text-gray-500">{downvote}</span>
          </div>
        </div>
        <p className="text-gray-500">{formatDistanceToNow(createdAt * 1000)} ago</p>
      </div>
    </div>
  )
}

export default function Home() {
  const [createCommunityModalOpen, setCreateCommunityModalOpen] = useState(false)
  const createCommunity = useCreateCommunity(() => setCreateCommunityModalOpen(false))

  return (
    <>
      <CustomModal isOpen={createCommunityModalOpen}>
        <CreateGroupFormUI onCreate={createCommunity} onCreateGroupClose={() => setCreateCommunityModalOpen(false)} />
      </CustomModal>
      <div className={'flex flex-col justify-between overflow-y-auto'}>
        <Header createCommunity={() => setCreateCommunityModalOpen(true)} />
        <Main />
        <Footer />
      </div>
    </>
  )
}

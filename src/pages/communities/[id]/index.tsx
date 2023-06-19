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
import EditorJsRenderer from '../../../components/editor-js/EditorJSRenderer'
import { EyeIcon, PencilIcon } from '@heroicons/react/20/solid'

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
      setIsLoading(false)
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
    postEditorRef?.current?.clear?.()
  }

  if (isLoading) return null

  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-12 p-24 md:px-2">
      <div className="flex items-center justify-between">
        <img
          className="border-indigo-500 h-20 w-20 rounded-full border-2 object-cover"
          src={`https://ipfs.io/ipfs/${community?.logo}`}
          alt="community logo"
        />
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
        <PostList
          posts={sortedData}
          isLoading={isLoading}
          data={data}
          voteForPost={voteForPost}
          handleSortChange={handleSortChange}
        />
      ) : (
        <NoPosts />
      )}
    </div>
  )
}

function PreviewButton(props: { onClick: () => void; previewVisible: boolean }) {
  return (
    <button
      onClick={props.onClick}
      className="flex items-center rounded-lg px-2.5 py-1 text-indigo-500 outline outline-indigo-500"
    >
      {props.previewVisible ? 'Show Editor' : 'Show Preview'}
      {props.previewVisible ? <PencilIcon className="ml-2 h-5 w-5" /> : <EyeIcon className="ml-2 h-5 w-5" />}
    </button>
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

  const [isPreviewVisible, setIsPreviewVisible] = React.useState(false)
  const [isNewPostVisible, setIsNewPostVisible] = React.useState(false)

  return (
    <div className="mt-6 border bg-white/10 px-6 py-6 ">
      {!isNewPostVisible && (
        <button onClick={() => setIsNewPostVisible(true)} className="rounded-lg bg-indigo-500 px-6 py-2 text-white">
          {t('newPost')}
        </button>
      )}

      {isNewPostVisible && (
        <>
          <div className="my-4 text-xl font-bold">{t('newPost')}</div>
          <>
            <input
              className="mt-2  w-[50%] rounded border-2 border-gray-200 p-3"
              placeholder={t('placeholder.enterPostTitle')}
              value={postTitle}
              onChange={e => setPostTitle(e.target.value)}
            />
            <div className="h-100 mt-2 ">
              {isPreviewVisible ? (
                <div>
                  <div className="my-4 flex items-center justify-between gap-8 text-lg ">
                    <div className="my-4 text-xl font-bold"> Preview</div>
                    <PreviewButton
                      onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                      previewVisible={isPreviewVisible}
                    />
                  </div>
                  <div className="h-96 cursor-not-allowed rounded-md">
                    <div className="prose mt-2 h-full w-full max-w-full rounded border-2 border-gray-200 px-6 py-0 text-white">
                      {postDescription && <EditorJsRenderer data={postDescription} />}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="my-4 flex items-center justify-between gap-8 text-lg">
                    <div className="my-4 text-xl font-bold"> Editor</div>
                    <PreviewButton
                      onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                      previewVisible={isPreviewVisible}
                    />
                  </div>

                  <div className="h-96  rounded-md">
                    <Editor
                      data={postDescription}
                      postEditorRef={postEditorRef}
                      onChange={setPostDescription}
                      placeholder={t('placeholder.enterPostContent')}
                      holder={id}
                      className="prose mt-2 h-full w-full max-w-full rounded border-2 border-gray-200 p-0 text-white"
                    />
                  </div>
                </div>
              )}

              <div className={'mt-4 flex justify-between px-0'}>
                <CancelButton
                  onClick={() => {
                    setIsNewPostVisible(false)
                    clearInput()
                  }}
                  className="rounded-lg bg-red-500 px-6 py-2 text-white"
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
              </div>
            </div>
          </>
        </>
      )}
    </div>
  )
}

const PostList = ({ posts, isLoading, data, voteForPost, handleSortChange }) => (
  <div className="mt-6 flex flex-col space-y-4 ">
    <SortBy onSortChange={handleSortChange} targetType="posts" />
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
      <CustomModal isOpen={createCommunityModalOpen} setIsOpen={setCreateCommunityModalOpen}>
        <CreateGroupFormUI onCreate={createCommunity} onCreateGroupClose={() => setCreateCommunityModalOpen(false)} />
      </CustomModal>
      <div className={'flex h-full flex-col justify-between overflow-y-auto'}>
        <Header createCommunity={() => setCreateCommunityModalOpen(true)} />
        <Main />
        <div className="flex-1" />
        <Footer />
      </div>
    </>
  )
}

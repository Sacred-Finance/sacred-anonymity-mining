import React, { useState, useRef, useEffect, memo, useMemo } from 'react'
import { Post, Topic } from '@components/Discourse/types'
import parse from 'html-react-parser'
import './topic-post.scss'
import { formatDistanceToNow } from '@/lib/utils'
import _ from 'lodash'
import ReplyToPost from '@components/Discourse/ReplyToPost'
import pluralize from 'pluralize'
import { motion, useAnimation } from 'framer-motion'
import { FingerPrintIcon, HandThumbDownIcon, HandThumbUpIcon } from '@heroicons/react/20/solid'
import { PrimaryButton } from '@components/buttons'
import { useFetchRepliesForPosts } from '@/hooks/useFetchRepliesForPosts'
import SummaryButton from '@components/buttons/AIPostSummaryButton'

const TopicPosts = ({ topic, mutate }: { topic: Topic; mutate: (newPost: Post) => void }) => {
  const postRefs = useRef<{ [key: number]: React.RefObject<HTMLDivElement> }>({})
  const [targetPostNumber, setTargetPostNumber] = useState<number | null>(null)
  const [postsInView, setPostsInView] = useState([])

  const filteredPosts = topic.post_stream.posts.filter(post => !post?.hidden && !post?.deleted_at)

  useEffect(() => {
    if (targetPostNumber) {
      const postRef = postRefs.current[targetPostNumber]
      if (postRef && postRef.current) {
        postRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTargetPostNumber(null) // Clear the target post number
      }
    }
  }, [targetPostNumber, topic])

  const controls = useAnimation()

  if (!topic || !filteredPosts) {
    return <div>Loading...</div>
  }

  return (
    <div className="relative flex w-full  ">
      <div className="topic-post relative flex w-full flex-col gap-4 ">
        {filteredPosts.length}

        {filteredPosts?.map(post => (
          <RenderPost
            key={post.id}
            post={post}
            postRefs={postRefs}
            setPostsInView={setPostsInView}
            controls={controls}
            setTargetPostNumber={setTargetPostNumber}
            addReplyToPosts={mutate}
          />
        ))}
      </div>
    </div>
  )
}

const StatsBadge = memo(
  ({
    label,
    value,
    icon,
    pluralizeLabel,
  }: {
    label?: string
    value?: string
    icon?: any
    pluralizeLabel?: boolean
  }) => (
    <div className="flex h-full cursor-auto items-center space-x-2 px-2 text-sm">
      {label && <span>{_.startCase(pluralizeLabel ? pluralize(label, value) : label)}</span>}
      {icon}
      {value && <span>{value}</span>}
    </div>
  )
)
StatsBadge.displayName = 'StatsBadge'

const UserInfo = ({ post }) => (
  <div className=" flex items-center space-x-4">
    <Avatar post={post} size={80} />
    <div className="flex-1">
      <div className="text-lg font-semibold text-gray-500">{_.startCase(post.username)}</div>
      <div className="text-sm text-gray-500">
        {_.startCase(formatDistanceToNow(new Date(post.created_at).getTime()))}
      </div>
    </div>
  </div>
)

const PostContent = ({ post }) => (
  <div className="rounded border border-gray-200 bg-gray-100 p-4 transition-colors duration-1000">
    <Cooked post={post} />

    {post?.link_counts?.length > 0 && (
      <div className="">
        <h3 className="text-lg font-semibold">Links:</h3>
        <ul className="list-inside list-disc space-y-1 text-blue-500">
          {post.link_counts.map((link, linkIndex) => (
            <li key={linkIndex}>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {link.title || link.url}
              </a>
              <span className="px-2 text-sm text-gray-500">({link.clicks} clicks)</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)

const RenderPost = ({ post, postRefs, setPostsInView, controls, setTargetPostNumber, addReplyToPosts }) => {
  if (!postRefs.current[post.post_number]) {
    postRefs.current[post.post_number] = React.createRef<HTMLDivElement>()
  }

  const onViewportEnter = async () => {
    setPostsInView(postsInView => [...postsInView, post.post_number])
  }
  const onViewportLeave = async () => {
    setPostsInView(postsInView => postsInView.filter(postInView => postInView !== post.post_number))
  }

  const postRef = postRefs.current[post.post_number]
  const replyToPostRef = post.reply_to_post_number ? postRefs.current[post.reply_to_post_number] : null

  return (
    <motion.div
      id={`post-${post.post_number}`}
      ref={postRefs.current[post.post_number]}
      animate={controls}
      initial={{ backgroundColor: '' }}
      onViewportEnter={onViewportEnter}
      onViewportLeave={onViewportLeave}
      viewport={{
        amount: 0.5,
      }}
      className=" grid w-full gap-4"
    >
      <div className="relative col-span-4 flex w-full flex-col ">
        <div className="z-10 flex items-center justify-between  rounded-t bg-primary-500 py-1 text-center text-white">
          <StatsBadge label="#" value={post.post_number} icon={<FingerPrintIcon width={20} />} />
          <div className="me-4 flex items-center text-base text-white">
            {_.startCase(formatDistanceToNow(new Date(post.created_at).getTime()))}
          </div>
        </div>
        <div
          id={`post-${post.post_number}`}
          ref={postRef}
          className="relative flex flex-col  border-primary-500 bg-white py-4 shadow-lg"
        >
          <PostHeader
            post={post}
            replyToPostRef={replyToPostRef}
            postRefs={postRefs}
            setTargetPostNumber={setTargetPostNumber}
          />

          <PostContent post={post} />
          <div className={'  flex w-full items-center justify-between'}>
            <SummaryButton postData={post.cooked} />
            <ReplyToPost post={post} addReplyToPosts={addReplyToPosts} /> &nbsp;
          </div>
        </div>

        <PostFooter post={post} />
      </div>
    </motion.div>
  )
}

const PostFooter = ({ post }) => (
  <div className="z-10 flex w-full items-center rounded-b bg-graySlate-800 px-3 py-1 text-white sm:justify-start md:justify-center">
    <div className={'flex-grow'} />

    <div className="flex items-center space-x-2">
      <StatsBadge label="score" value={post.score.toString()} />
      <StatsBadge label="reads" value={post.reads.toString()} />
      <StatsBadge pluralizeLabel label={'Reply'} value={post.reply_count.toString()} />
    </div>
    <div className={'flex-grow'} />
    <div className={'flex h-full items-center gap-4 justify-self-end'}>
      <PrimaryButton disabled>
        <HandThumbUpIcon width={20} />
      </PrimaryButton>

      <PrimaryButton disabled>
        <HandThumbDownIcon width={20} />
      </PrimaryButton>
    </div>
  </div>
)

const LinkedPostButton = ({ postNumber, setTargetPostNumber }) => (
  <button
    className="rounded-full border text-xs hover:bg-gray-700 hover:text-white"
    onClick={() => {
      setTargetPostNumber(postNumber)
    }}
  >
    <StatsBadge value={postNumber} />
  </button>
)

const PostHeader = ({ post, replyToPostRef, postRefs, setTargetPostNumber }) => (
  <header className=" flex w-full justify-between">
    {post.reply_to_post_number ? (
      <div className="flex gap-4">
        Reply to:
        <LinkedPostButton
          postNumber={post.reply_to_post_number}
          postRefs={replyToPostRef || postRefs}
          setTargetPostNumber={setTargetPostNumber}
        />
      </div>
    ) : (
      <UserInfo post={post} />
    )}

    {post?.replies?.length > 0 && (
      <div className="flex items-center gap-4 justify-self-end ">
        Replies:
        {post.replies.map(reply => (
          <LinkedPostButton
            key={`${post.id}-${reply.id}`}
            postNumber={reply.post_number}
            setTargetPostNumber={setTargetPostNumber}
          />
        ))}
      </div>
    )}
  </header>
)

function Avatar({ post, size }: { post: Topic['post_stream']['posts'][0]; size?: number }) {
  return post.avatar_template ? (
    <img
      className="rounded-full"
      src={`https://sea1.discourse-cdn.com/basic10${post.avatar_template.replace(
        '{size}',
        size ? size.toString() : '90'
      )}`}
      alt={post.username}
    />
  ) : (
    <div className="h-16 w-16 rounded-full bg-gray-500" />
  )
}

function Cooked(props: { post: any }) {
  return <span className="cooked text-base leading-normal">{parse(props.post.cooked)}</span>
}

export default TopicPosts

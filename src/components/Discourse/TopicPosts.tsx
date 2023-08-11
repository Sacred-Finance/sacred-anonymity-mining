import React, { useState, useRef, useEffect } from 'react'
import { Topic } from '@components/Discourse/types'
import parse from 'html-react-parser'
import './topic-post.scss'
import { formatDistanceToNow } from '@/lib/utils'
import _ from 'lodash'
import ReplyToPost from '@components/Discourse/ReplyToPost'
import pluralize from 'pluralize'
import clsx from 'clsx'
import { motion, useAnimation } from 'framer-motion'

const TopicPosts = ({ topic }: { topic: Topic }) => {
  const postRefs = useRef<{ [key: number]: React.RefObject<HTMLDivElement> }>({})
  const [postsInView, setPostsInView] = useState([])
  const controls = useAnimation()

  if (!topic) {
    return <div>Loading...</div>
  }

  const renderPost = post => {
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
        className="grid w-full gap-4"
      >
        <div className="relative col-span-4 flex w-full flex-col ">
          <div className="flex items-center rounded-t z-10  bg-primary-500 py-1 text-center text-xs text-white">
            <StatsBadge label="#" value={post.post_number} />
          </div>
          <div
            id={`post-${post.post_number}`}
            ref={postRef}
            className="relative flex flex-col border-x  border-primary-500 bg-white p-4 shadow-lg"
          >
            <PostHeader post={post} replyToPostRef={replyToPostRef} postRefs={postRefs} />
            {/*<UserInfo post={post} />*/}
            <PostContent post={post} />
            <div className={'mt-4 flex w-full justify-between'}>
              <div />
              <ReplyToPost
                post={post}
                formProps={{
                  showButtonWhenFormOpen: true,
                }}
              />
            </div>
          </div>
          <PostFooter post={post} />
        </div>
      </motion.div>
    )
  }

  const posts = topic.post_stream.posts.filter(post => !post.hidden && !post.deleted_at)
  const nestedPosts = prepareNestedPosts(posts)

  return (
    <div className="relative flex w-full">
      <div className="topic-post relative flex w-full flex-col gap-4">
        {nestedPosts.map((post, index) => renderPost(post, index))}
        {/*<Timeline posts={nestedPosts} postsInView={postsInView} />*/}
      </div>
    </div>
  )
}

const StatsBadge = ({ label, value, onClick }: { label?: string; value?: string | number; onClick?: () => void }) => (
  <>
    <div className="flex h-full cursor-auto  items-center space-x-2 px-2 text-sm " onClick={onClick}>
      {label && <span>{_.startCase(label)}</span>}
      {value && <span>{value}</span>}
    </div>
  </>
)

export default TopicPosts
const prepareNestedPosts = posts => {
  const postMap = new Map()
  const resultPosts = []

  // Initialize replies array and map the posts by post_number
  posts.forEach(post => {
    post.replies = []
    postMap.set(post.post_number, post)
  })

  // Link replies to their parent posts
  posts.forEach(post => {
    if (post.reply_to_post_number) {
      const parentPost = postMap.get(post.reply_to_post_number)
      if (parentPost) parentPost.replies.push(post)
    }
  })

  // Add all posts to the result, including root posts and replies
  posts.forEach(post => {
    resultPosts.push(post)
  })

  return resultPosts
}

const UserInfo = ({ post }) => (
  <div className="mb-4 flex items-center space-x-4">
    <Avatar post={post} size={80} />
    <PostMetaData post={post} />
  </div>
)

const PostContent = ({ post }) => (
  <div className="mt-4 rounded border border-gray-200 bg-gray-100 p-4 transition-colors duration-1000">
    <Cooked post={post} className="cooked text-base leading-normal" />

    {post?.link_counts?.length > 0 && (
      <div className="mt-4">
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

const PostFooter = ({ post }) => (
  <div className="flex items-center justify-center rounded-b z-10 bg-primary-500 px-3 py-1 text-white">
    <StatsBadge label="score" value={post.score} />
    <StatsBadge label="reads" value={post.reads} />
    <StatsBadge label={pluralize('Reply', post.reply_count)} value={post.reply_count} />
  </div>
)

const PostHeader = ({ post, replyToPostRef, postRefs }) => (
  <header className="mb-4 flex w-full justify-between">
    {post.reply_to_post_number ? (
      <div className="flex gap-2">
        Reply to:
        <button
          className="rounded-full border text-xs  hover:bg-gray-700 hover:text-white"
          onClick={() => {
            replyToPostRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // change background color of the post we scrolled to
            const secondChild = postRefs.current[post.reply_to_post_number]?.current?.children[1]

            // change background color of the second child of the post we scrolled to for 2 seconds
            if (secondChild) {
              secondChild.style.backgroundColor = 'gray'

              // You may want to add a transition for a smooth effect
              secondChild.style.transition = 'background-color 0.5s ease'

              setTimeout(() => {
                secondChild.style.backgroundColor = '' // revert to the original color
              }, 2000)
            }
          }}
        >
          <StatsBadge value={post.reply_to_post_number} />
        </button>
      </div>
    ) : (
      <UserInfo post={post} />
    )}

    {post.replies.length > 0 && (
      <div className="flex items-center gap-2 justify-self-end ">
        Replies:
        {post.replies.map((reply, replyIndex) => (
          <button
            key={replyIndex}
            className="rounded-full border text-xs  hover:bg-gray-700 hover:text-white"
            onClick={() => {
              postRefs.current[reply.post_number]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

              // change background color of the post we scrolled to
              const secondChild = postRefs.current[reply.post_number]?.current?.children[1]

              // change background color of the second child of the post we scrolled to for 2 seconds
              if (secondChild) {
                secondChild.style.backgroundColor = 'gray'

                // You may want to add a transition for a smooth effect
                secondChild.style.transition = 'background-color 0.5s ease'

                setTimeout(() => {
                  secondChild.style.backgroundColor = '' // revert to the original color
                }, 2000)
              }
            }}
          >
            <StatsBadge value={reply.post_number} />
          </button>
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

function PostMetaData({ post }: { post: Topic['post_stream']['posts'][0] }) {
  return (
    <div className="flex-1">
      <div className="text-lg font-semibold text-gray-500">{_.startCase(post.username)}</div>
      <div className="text-sm text-gray-500">
        {_.startCase(formatDistanceToNow(new Date(post.created_at).getTime()))}
      </div>
    </div>
  )
}

function Cooked(props: { post: any }) {
  return <p className="cooked text-base leading-normal">{parse(props.post.cooked)}</p>
}

function Timeline({ posts, postsInView }) {
  return (
    <div className="flex flex-col gap-4">
      {posts.map((post, index) => (
        <div
          key={index}
          className={clsx(
            'flex flex-col gap-4',
            postsInView.includes(post.post_number) ? 'bg-gray-100' : 'bg-gray-200'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar post={post} size={80} />
              <PostMetaData post={post} />
            </div>
            <div className="flex items-center space-x-4">
              <StatsBadge label="score" value={post.score} />
              <StatsBadge label="reads" value={post.reads} />
              <StatsBadge label={pluralize('Reply', post.reply_count)} value={post.reply_count || '0'} />
            </div>
          </div>
          <div className="mt-4 rounded border border-gray-200 bg-gray-100 p-4 transition-colors duration-1000">
            <Cooked post={post} className="cooked text-base leading-normal" />
          </div>
        </div>
      ))}
    </div>
  )
}

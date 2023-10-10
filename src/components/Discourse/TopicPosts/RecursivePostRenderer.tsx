import { Post } from '@components/Discourse/types'
import React, { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { RenderPost } from '@components/Discourse/TopicPosts/RenderPost'
import pluralize from 'pluralize'

interface RecursivePostRendererProps {
  post: Post & {
    replies?: Post[]
  }
  postRefs: {
    [key: number]: React.RefObject<HTMLDivElement>
  }
  setPostsInView: (posts: any[]) => void
  controls: any // Assuming 'controls' type based on your snippet. Adjust if necessary.
  setTargetPostNumber: React.Dispatch<React.SetStateAction<number | null>>
  addReplyToPosts: (newPost: Post) => void
  depth?: number
}

export const RecursivePostRenderer: React.FC<RecursivePostRendererProps> = ({
  post,
  postRefs,
  setPostsInView,
  controls,
  setTargetPostNumber,
  addReplyToPosts,
  depth = 0,
}) => {
  return (
    <>
      <br />
      <RenderPost
        key={post.id}
        post={post}
        postRefs={postRefs}
        setPostsInView={setPostsInView}
        controls={controls}
        setTargetPostNumber={setTargetPostNumber}
        addReplyToPosts={addReplyToPosts}
        depth={depth}
      />

      <ResponseAccordion>
        {post.replies?.map(reply => (
          <RecursivePostRenderer
            key={reply.id}
            post={reply}
            postRefs={postRefs}
            setPostsInView={setPostsInView}
            controls={controls}
            setTargetPostNumber={setTargetPostNumber}
            addReplyToPosts={addReplyToPosts}
            depth={depth + 1}
          />
        ))}
      </ResponseAccordion>
    </>
  )
}

const ResponseAccordion = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [show, setShow] = useState(true)
  const toggleShow = async () => {
    setShow(!show)
  }

  if (!React.Children.count(children)) return null

  return (
    <AnimatePresence mode={'wait'}>
      <button
        onClick={toggleShow}
        className="flex w-full items-center justify-between gap-2 text-sm text-gray-500 transition-colors duration-200 hover:text-gray-700 focus:outline-none "
      >
        {show ? 'Hide' : 'Show'} {children && pluralize('Response', React.Children.count(children), true)}
        <ChevronDownIcon width={20} className={show ? 'rotate-180 transform' : ''} />
      </button>
      <div className={clsx(className)}>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: show ? 1 : 0, height: show ? 'auto' : 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, opacity: { delay: 0.1 }, type: 'tween' }}
        >
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

import React, { useRef, useState } from 'react'
import { Topic } from '@components/Discourse/types'
import parse from 'html-react-parser'
import './topic-post.scss'
import { formatDistanceToNow } from '@/lib/utils'
import _ from 'lodash'
import { NewPostForm } from '@components/NewPostForm'
import { OutputData } from '@editorjs/editorjs'
import clsx from 'clsx'
import { PrimaryButton } from '@components/buttons'

function ExpandCollapsePostButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <PrimaryButton
      onClick={onClick}
      className={clsx(
        'absolute bottom-2.5 bg-gray-500 right-3.5',
        ' border text-xs text-white transition-colors duration-150 hover:bg-gray-500 hover:text-white',
        ` ${isOpen ? 'text-red-500' : 'text-gray-500'}`
      )}
    >
      <div className="flex items-center justify-center ">
        <span>{isOpen ? 'Hide' : 'Expand'}</span>
      </div>
    </PrimaryButton>
  )
}

const TopicPosts = ({ topic }: { topic: Topic }) => {
  const [expandedPosts, setExpandedPosts] = useState<number[]>([])
  const editorRef = useRef(null)
  const [postEditorData, setPostEditorData] = useState<OutputData[]>([])

  const togglePostExpansion = (index: number) => {
    if (expandedPosts.includes(index)) {
      setExpandedPosts(expandedPosts.filter(i => i !== index))
    } else {
      setExpandedPosts([...expandedPosts, index])
    }
  }

  if (!topic) {
    return <div>Loading...</div>
  }

  return (
    <div className="topic-post flex w-full flex-col ">
      {topic.post_stream.posts.map((post, index) => {
        if (post.hidden || post.deleted_at) return null

        return (
          <div className="relative  my-4  flex flex-col border-2 bg-gray-50 px-2 pt-8" key={index}>
            <div className="mb-4 flex items-center space-x-4">
              {post.avatar_template && (
                <img
                  className="rounded-full"
                  src={`https://sea1.discourse-cdn.com/basic10${post.avatar_template.replace('{size}', '96')}`}
                  alt={post.username}
                />
              )}
              <div className="flex-1">
                <div className="text-lg font-semibold text-gray-500">{_.startCase(post.username)}</div>
                <div className="text-sm text-gray-500">
                  Posted {_.startCase(formatDistanceToNow(new Date(post.created_at).getTime()))}
                </div>
              </div>
            </div>

            <div className={'sticky top-0'}>
              <div className="flex h-32 w-full items-center justify-center  text-sm px-4  ">
                <div className="flex h-16 w-full items-center justify-center rounded bg-gray-600 px-2  ">
                  <NewPostForm
                    classes={{
                      root: 'w-full justify-stretch border-black ',
                      openFormButton:
                        'border-white text-white hover:bg-gray-500 hover:text-white justify-self-center',
                      formContainer: 'bg-white p-3 w-full border border-gray-300 rounded shadow-xl',
                      cancelButton: 'text-gray-500 hover:text-gray-700',
                    }}
                    formVariant={'icon'}
                    editorId={`${post.id}_post`}
                    editorReference={editorRef}
                    title={false}
                    setTitle={() => {}}
                    description={postEditorData[index]}
                    setDescription={(description: OutputData) => {
                      const newDescriptions = [...postEditorData]
                      newDescriptions[index] = description
                      setPostEditorData(newDescriptions)
                    }}
                    resetForm={() => {
                      // @ts-ignore
                      editorRef.current.clear()
                    }}
                    isReadOnly={false}
                    isEditable={true}
                    handleSubmit={() => {
                      console.log('submit')
                    }}
                    openFormButtonText={'Reply'}
                    handlerType={'new'}
                    submitButtonText={'Submit'}
                  />
                  <StatsDivider />
                  <StatsBadge label="replies" value={post.reply_count} />
                  <StatsDivider />
                  <StatsBadge label="reads" value={post.reads} />
                  <StatsDivider />
                  <StatsBadge label="score" value={post.score} />
                  <StatsDivider />
                </div>
              </div>
            </div>

            {!expandedPosts.includes(index) && (
              <div className="mt-4 max-h-12 select-none overflow-y-hidden overflow-ellipsis bg-gray-50">
                <p className="cooked text-base leading-normal">{parse(post.cooked)}</p>
              </div>
            )}
            {(expandedPosts.includes(index) || parse(post.cooked)?.length < 3) && (
              <div className="mt-4 bg-gray-50 ">
                <p className="cooked text-base leading-normal ">{parse(post.cooked)}</p>
                {post?.link_counts?.length > 0 && (
                  <div className="mt-4 ">
                    <h3 className="text-lg font-semibold ">Links:</h3>
                    <ul className="list-inside list-disc">
                      {post.link_counts.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.title || link.url}
                          </a>
                          <span className="px-2 text-sm text-gray-500">({link.clicks} clicks)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {parse(post.cooked)?.length >= 3 && (
              <div className={'flex h-10 items-center justify-center select-none '}>
                {!expandedPosts.includes(index) && <div>. . . </div>}
                <ExpandCollapsePostButton
                  onClick={() => togglePostExpansion(index)}
                  isOpen={expandedPosts.includes(index)}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default TopicPosts

const StatsBadge = ({ label, value }: { label: string; value: string | number }) => (
  <>
    <div className="flex h-full cursor-auto select-none items-center space-x-2 px-2 text-sm  text-white ">
      <span>{label}</span>
      <span>{value || 0}</span>
    </div>
  </>
)

function StatsDivider() {
  return <span className="mx-1 w-0.5 self-stretch bg-gray-300  text-gray-500" />
}

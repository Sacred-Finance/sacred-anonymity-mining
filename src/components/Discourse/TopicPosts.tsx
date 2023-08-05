import React, { useRef, useState } from 'react'
import { Topic } from '@components/Discourse/types'
import parse from 'html-react-parser'
import './topic-post.scss'
import { formatDistanceToNow } from '@/lib/utils'
import _ from 'lodash'
import { NewPostForm } from '@components/NewPostForm'
import EditorBlock from '@components/editor-js/Editor'
import { OutputData } from '@editorjs/editorjs'

function StatsDivider() {
  return <span className="w-0.5 self-stretch bg-gray-200 text-sm text-gray-500" />
}

function OpenPostContentDivider({
  onClick,
  numbers,
  searchElement,
}: {
  onClick: () => void
  numbers: number[]
  searchElement: number
}) {
  const isOpen = numbers.includes(searchElement)

  return (
    <button onClick={onClick} className={'w-full'}>
      <div className="flex items-center justify-center">
        <span className={`text-sm  ${isOpen ? 'text-red-500' : 'text-gray-500'}`}>{isOpen ? 'Close' : 'Expand'}</span>
      </div>
    </button>
  )
}

const TopicPosts = ({ topic }: { topic: Topic }) => {
  const [openPosts, setOpenPosts] = useState<number[]>([]) // Track which posts are open

  const editorRef = useRef(null)
  const [postDescriptions, setPostDescriptions] = useState<OutputData[]>([]) // Track the descriptions of the posts

  const togglePost = (index: number) => {
    if (openPosts.includes(index)) {
      setOpenPosts(openPosts.filter(i => i !== index))
    } else {
      setOpenPosts([...openPosts, index])
    }
  }

  if (!topic) {
    return <div>Loading...</div>
  }

  return (
    <div className="topic-post flex w-full flex-col">
      {topic.post_stream.posts.map((post, index) => {
        if (post.hidden || post.deleted_at) return null

        return (
          <div className="my-4  flex min-h-[200px] flex-col  pb-8 first:border-t-4 first:pt-8" key={index}>
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
              <NewPostForm
                editorId={`${topic.id}_post`}
                editorReference={editorRef}
                title={false}
                setTitle={() => {}}
                description={postDescriptions[index]}
                setDescription={(description: OutputData) => {
                  const newDescriptions = [...postDescriptions]
                  newDescriptions[index] = description
                  setPostDescriptions(newDescriptions)
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
                submitButtonText={'Reply'}
              />
            </div>

            <div className={'sticky top-0'}>
              <div className="my-2 flex h-10 items-center justify-center  border-y-2  text-sm">
                <StatsDivider />
                <StatsBadge label="replies" value={post.reply_count} />
                <StatsDivider />
                <StatsBadge label="reads" value={post.reads} />
                <StatsDivider />
                <StatsBadge label="score" value={post.score} />
                <StatsDivider />
              </div>

            </div>

            {!openPosts.includes(index) && (
              <div className="mt-4 max-h-12 overflow-y-hidden overflow-ellipsis">
                <p className="cooked text-base leading-normal">{parse(post.cooked)}</p>
              </div>
            )}
            {(openPosts.includes(index) || parse(post.cooked).length < 3) && (
              <div className="mt-4">
                <p className="cooked text-base leading-normal">{parse(post.cooked)}</p>
                {post?.link_counts?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold">Links:</h3>
                    <ul className="list-inside list-disc">
                      {post.link_counts.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.title || link.url}
                          </a>
                          <span className="text-sm text-gray-500">({link.clicks} clicks)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {parse(post.cooked).length >= 3 && (
                <OpenPostContentDivider onClick={() => togglePost(index)} numbers={openPosts} searchElement={index} />
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
    <div className="flex h-full cursor-auto select-none items-center space-x-2 px-2 text-sm  text-gray-500 ">
      <span>{label}</span>
      <span>{value || 0}</span>
    </div>
  </>
)

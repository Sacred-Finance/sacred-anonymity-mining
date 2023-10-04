import { StatsBadge } from '@components/Discourse/TopicPosts/StatsBadge'
import { PrimaryButton } from '@components/buttons'
import { HandThumbDownIcon, HandThumbUpIcon } from '@heroicons/react/20/solid'
import ReplyToPost from '@components/Discourse/ReplyToPost'
import React from 'react'

export const PostFooter = ({ post, addReplyToPosts }) => (
  <div className=" flex w-full items-center rounded-full bg-primary-500  text-white sm:justify-start md:justify-center">
    <div className="flex items-center space-x-2">
      <StatsBadge label="score" value={post.score.toString()} />
      <StatsBadge label="reads" value={post.reads.toString()} />
      <StatsBadge pluralizeLabel label={'Reply'} value={post.reply_count.toString()} />
    </div>
    <div className={'text-dark flex  h-full items-center gap-4 justify-self-end px-2'}>
      <PrimaryButton disabled>
        <HandThumbUpIcon width={20} />
      </PrimaryButton>

      <PrimaryButton disabled>
        <HandThumbDownIcon width={20} />
      </PrimaryButton>

      <ReplyToPost post={post} addReplyToPosts={addReplyToPosts} />
    </div>
  </div>
)

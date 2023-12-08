import { StatsBadge } from '@components/Discourse/TopicPosts/StatsBadge'
import ReplyToDiscoursePost from '@components/Discourse/ReplyToDiscoursePost'
import React from 'react'

export const PostFooter = ({ post, addReplyToPosts, readonly = false }) => (
  <div className="flex w-full items-center space-x-4 rounded-lg text-white  sm:justify-start md:justify-center">
    <div className="flex items-center space-x-2">
      <StatsBadge label="score" value={post.score.toString()} />
      <StatsBadge label="reads" value={post.reads.toString()} />
      <StatsBadge
        pluralizeLabel
        label={'Reply'}
        value={post.reply_count.toString()}
      />
    </div>
    <div className={'flex h-full items-center gap-4'}>
      <ReplyToDiscoursePost
        post={post}
        addReplyToPosts={addReplyToPosts}
        readonly={readonly}
      />
    </div>
  </div>
)

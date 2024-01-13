import type { NextApiRequest, NextApiResponse } from 'next/types'
import { forumContract } from '@/constant/const'
import { augmentGroupData, augmentItemData } from '@/utils/communityUtils'
import type { Group, Item, RawGroupData, RawItemData } from '@/types/contract/ForumInterface'

export type GroupWithPostAndCommentDataResponse = {
  group: Group
  posts: Item
  comments: Item[] | []
}
// get group details
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GroupWithPostAndCommentDataResponse | { error: string }>
) {
  try {
    const { groupId, postId } = req.query
    const bigIntGroupId = BigInt(groupId as string)
    const bigIntPostId = BigInt(postId as string)

    const [rawPostData, rawGroupData] = await Promise.all([
      forumContract.read.itemAt([bigIntPostId]),
      forumContract.read.groupAt([bigIntGroupId]),
    ])
    const [post, group] = await Promise.all([
      augmentItemData(rawPostData as unknown as RawItemData),
      augmentGroupData(rawGroupData as unknown as RawGroupData),
    ])

    // posts and comments are fetched in the same way. the only difference is that comments are queried from the id's held within posts childIds array
    const rawComments = await Promise.all(
      post.childIds.map(commentId => forumContract.read.itemAt([BigInt(commentId)]))
    )

    // todo: the filter can be moved higher up the chain to reduce the number of comments fetched
    const comments = await Promise.all(rawComments.map(c => augmentItemData(c))).then(comments =>
      comments.filter(c => !c.removed)
    )

    res.status(200).json({ group, post, comments })
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: 'Unknown error' })
    }
  }
}

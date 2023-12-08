import type { NextApiRequest, NextApiResponse } from 'next/types'
import { forumContract } from '@/constant/const'
import { augmentGroupData, augmentItemData } from '@/utils/communityUtils'
import type { Group, Item } from '@/types/contract/ForumInterface'

// get group details
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    { group: Group; post: Item; comments: Item[] } | { error: string }
  >
) {
  try {
    const { groupId, postId } = req.query
    const rawGroupData = await forumContract.groupAt(groupId)
    const group = await augmentGroupData(rawGroupData)

    // get post details
    const rawPostData = await forumContract.itemAt(postId)
    const post = await augmentItemData(rawPostData)

    // posts and comments are fetched in the same way. the only difference is that comments are queried from the id's held within posts childIds array
    const rawComments = await Promise.all(
      post.childIds.map(commentId => forumContract.itemAt(commentId))
    )

    const comments = await Promise.all(
      rawComments.map(c => augmentItemData(c))
    ).then(comments => comments.filter(c => !c.removed))

    res.status(200).json({ group, post, comments })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message })
  }
}

import { NextApiRequest, NextApiResponse } from 'next/types'
import { forumContract } from '@/constant/const'
import { augmentGroupData, augmentItemData } from '@/utils/communityUtils'
import { Group, Item } from '@/types/contract/ForumInterface'
import { ethers } from 'ethers'
import { User } from '@/lib/model'
import { parseBytes32String } from 'ethers/lib/utils'

// get group details
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ group: Group; posts: Item[]; users: User[] } | { error: string }>
) {
  try {
    const { groupId } = req.query
    const rawGroupData = await forumContract.groupAt(groupId)
    const group = await augmentGroupData(rawGroupData)
    const rawPostData = await Promise.all(group.posts.map(postId => forumContract.itemAt(postId)))
    const posts = await Promise.all(rawPostData.map(rawPost => augmentItemData(rawPost)))
    const filteredPosts = posts.filter(
      post => post.contentCID && post.contentCID !== ethers.constants.HashZero && !post.removed
    )

    const users = await forumContract.queryFilter(forumContract.filters.NewUser())

    res.status(200).json({
      group,
      posts: filteredPosts,
      users: users.map(({ args }) => ({
        name: parseBytes32String(args.username),
        groupId: +args.groupId.toString(),
        identityCommitment: args.identityCommitment.toString(),
      })) as unknown as User[],
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

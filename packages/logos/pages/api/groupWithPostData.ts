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

    const usersWithCommitment = await forumContract.groupUsers(groupId)

    res.status(200).json({
      group,
      posts: filteredPosts,
      users: usersWithCommitment.map((c, i) => ({
        name: 'anon',
        groupId: groupId.toString(),
        identityCommitment: c.toString(),
      })) as unknown as User[],
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

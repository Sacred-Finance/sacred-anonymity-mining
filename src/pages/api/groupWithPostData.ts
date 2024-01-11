import type { NextApiRequest, NextApiResponse } from 'next/types'
import { forumContract } from '@/constant/const'
import { augmentGroupData, augmentItemData } from '@/utils/communityUtils'
import type { Group, Item, RawGroupData, RawItemData } from '@/types/contract/ForumInterface'
import type { User } from '@/lib/model'
import { HashZero } from '@/lib/utils'

export type GroupWithPostDataResponse = {
  group: Group
  posts: Item[] | []
  users: User[] | []
}

// get group details
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GroupWithPostDataResponse | { error: string }>
) {
  try {
    const { groupId } = req.query
    const bigIntGroupId = BigInt(groupId as string)
    const rawGroupData = (await forumContract.read.groupAt([bigIntGroupId])) as unknown as RawGroupData

    if (rawGroupData.removed) {
      return res.status(404).json({ error: 'Group not found' })
    }

    const group = await augmentGroupData(rawGroupData)

    const rawPostResults = (await Promise.all(
      rawGroupData.posts.map(async postId => {
        try {
          return await forumContract.read.itemAt([postId])
        } catch (err) {
          console.error('Error fetching post:', err)
          return res.status(500).json({ error: 'An error occurred while fetching post' })
        }
      })
    )) as unknown as RawItemData[]

    const filteredRawPosts = rawPostResults.filter(
      post => post.contentCID && post.contentCID !== HashZero && !post.removed
    ) as RawItemData[]

    const augmentedPosts = (await Promise.all(
      filteredRawPosts.map(async post => {
        try {
          return await augmentItemData(post)
        } catch (err) {
          console.error('Error augmenting post:', err)
          return res.status(500).json({ error: 'An error occurred while augmenting post' })
        }
      })
      // @ts-expect-error: filter removes nulls, needs to be fixed
    )?.then(posts => posts.filter((p: Item) => !p.removed))) as Item[]

    const usersWithCommitment = await forumContract.read.groupUsers([bigIntGroupId])

    return res.status(200).json(<GroupWithPostDataResponse>{
      group,
      posts: augmentedPosts,
      users: usersWithCommitment.map(c => ({
        name: 'anon',
        groupId: groupId?.toString(),
        identityCommitment: c.toString(),
      })) as unknown as User[],
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('no group at index')) {
      return res.status(404).json({ error: err.message })
    }
    if (err instanceof Error) {
      return res.status(500).json({ error: err?.message || 'Unknown error' })
    }
    return res.status(500).json({ error: 'Unknown error' })
  }
}

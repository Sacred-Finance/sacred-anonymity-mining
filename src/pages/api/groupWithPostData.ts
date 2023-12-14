import type { NextApiRequest, NextApiResponse } from 'next/types'
import { forumContract, ForumContractAddress } from '@/constant/const'
import { augmentGroupData, augmentItemData } from '@/utils/communityUtils'
import type {
  Group,
  RawItemData,
  RawGroupData, Item,
} from '@/types/contract/ForumInterface'
import type { User } from '@/lib/model'
import { multicall } from '@wagmi/core'
import { abi } from '@/constant/abi'
import { polygonMumbai } from 'wagmi/chains'

// get group details
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    { group: Group; posts: Item[]; users: User[] } | { error: string }
  >
) {
  try {
    const { groupId } = req.query
    const bigIntGroupId = BigInt(groupId as string)
    const rawGroupData = (await forumContract.read.groupAt([
      bigIntGroupId,
    ])) as unknown as RawGroupData

    if (rawGroupData.removed) {
      return res.status(404).json({ error: 'Group not found' })
    }
    const group = await augmentGroupData(rawGroupData)

    const postIds = rawGroupData.posts.map(p => p)

    const wagmigotchiContract = {
      address: ForumContractAddress,
      abi: abi,
    } as const

    const postData = postIds.map(id => ({
      address: ForumContractAddress,
      functionName: 'itemAt',
      abi: wagmigotchiContract.abi,
      args: [id],
    }))

    const rawPostResults = await multicall({
      allowFailure: true,
      chainId: polygonMumbai.id,
      contracts: postData,
    })

    const rawPosts = rawPostResults.map(data => data.result) as RawItemData[]

    const filteredRawPosts = rawPosts.filter(
      post =>
        // post.contentCID &&
        // post.contentCID !== ethers.constants.HashZero &&
        !post.removed
    ) as RawItemData[]

    const augmentedPosts = (await Promise.all(
      filteredRawPosts.map(async post => {
        try {
          return await augmentItemData(post)
        } catch (err) {
          console.error('Error augmenting post:', err)
          return res
            .status(500)
            .json({ error: 'An error occurred while augmenting post' })
        }
      })
    ))

    const usersWithCommitment = await forumContract.read.groupUsers([
      bigIntGroupId,
    ])

    res.status(200).json({
      group,
      posts: augmentedPosts,
      users: usersWithCommitment.map((c, i) => ({
        name: 'anon',
        groupId: groupId.toString(),
        identityCommitment: c.toString(),
      })) as unknown as User[],
    })
  } catch (err) {
    console.trace(err)
    if (err.message.includes('no group at index')) {
      return res.status(404).json({ error: err.message })
    }
    res.status(500).json({ error: err.message })
  }
}

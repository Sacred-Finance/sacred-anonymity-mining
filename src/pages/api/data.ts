import { forumContract } from '@/constant/const'
import type { User } from '@/lib/model'
import type { Group } from '@/types/contract/ForumInterface'
import { augmentGroupData } from '@/utils/communityUtils'
import { parseBytes32String } from 'ethers/lib/utils'

export default async (req, res) => {
  if (!forumContract) {
    res.status(500).json({ error: 'Forum contract not found' })
    return
  }

  let groupCount, rawCommunitiesData, communitiesData, users

  try {
    groupCount = await forumContract.groupCount()
  } catch (e) {
    console.error('Error fetching group count:', e)
    res
      .status(500)
      .json({ error: 'An error occurred while fetching group count' })
    return
  }

  try {
    const groups = Array.from({ length: groupCount }, (_, i) => i)
    rawCommunitiesData = await Promise.all(
      groups.map(groupId => forumContract.groupAt(groupId))
    )
  } catch (e) {
    console.error('Error fetching raw communities data:', e)
    res
      .status(500)
      .json({ error: 'An error occurred while fetching raw communities data' })
    return
  }

  try {
    communitiesData = await Promise.all(
      rawCommunitiesData
        .filter(r => !r.removed)
        .map(rawGroupData => augmentGroupData(rawGroupData))
    )
  } catch (e) {
    console.error('Error processing communities data:', e)
    res
      .status(500)
      .json({ error: 'An error occurred while processing communities data' })
    return
  }

  try {
    users = await forumContract.queryFilter(forumContract.filters.NewUser())
  } catch (e) {
    console.error('Error querying users:', e)
    res.status(500).json({ error: 'An error occurred while querying users' })
    return
  }

  res.status(200).json({
    communitiesData: communitiesData as Group[],
    users: users.map(({ args }) => ({
      name: parseBytes32String(args.username),
      groupId: +args.groupId.toString(),
      identityCommitment: args.identityCommitment.toString(),
    })) as unknown as User[],
  })
}

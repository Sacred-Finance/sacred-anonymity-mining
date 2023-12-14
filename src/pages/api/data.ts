import { forumContract } from '@/constant/const'
import type { Group } from '@/types/contract/ForumInterface'
import { augmentGroupData } from '@/utils/communityUtils'
import type { User } from '@/lib/model'

export default async (req, res) => {
  if (!forumContract) {
    res.status(500).json({ error: 'Forum contract not found' })
    return
  }

  let groupCount, rawCommunitiesData, communitiesData, users

  try {
    groupCount = await forumContract.read.groupCount()
    groupCount = groupCount.toString()
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
      groups.map(groupId => {
        //forumContract.read.groupAt(1)
        console.error('groupId', groupId)
        return forumContract.read.groupAt([groupId])
      })
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
    users = await forumContract.getEvents.NewUser()
  } catch (e) {
    console.error('Error querying users:', e)
    res.status(500).json({ error: 'An error occurred while querying users' })
    return
  }

  res.status(200).json({
    communitiesData: communitiesData as Group[],
    users: users.map(({ args }) => ({
      name: args.username,
      groupId: +args.groupId.toString(),
      identityCommitment: args.identityCommitment.toString(),
    })) as unknown as User[],
  })
}

import { forumContract } from '@/constant/const'
import { User } from '@/lib/model';
import { Group } from '@/types/contract/ForumInterface';
import { augmentGroupData } from '@/utils/communityUtils'
import { parseBytes32String } from 'ethers/lib/utils'

export default async (req, res) => {
    if (!forumContract) {
        res.status(500).json({ error: 'Forum contract not found' });
        return;
    }
    try {
        const groupCount = await forumContract.groupCount()
        const groups = Array.from({ length: groupCount }, (_, i) => i)
        const rawCommunitiesData = await Promise.all(groups.map(groupId => forumContract.groupAt(groupId)))
        const communitiesData = await Promise.all(rawCommunitiesData.filter(r => !r.removed).map(rawGroupData => augmentGroupData(rawGroupData)))

        res.status(200).json({
            communitiesData: communitiesData as Group[],
        });
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'An error occurred while fetching data' })
    }
}

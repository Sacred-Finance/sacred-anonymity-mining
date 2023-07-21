import HomePage from '../components/HomePage'
import WithStandardLayout from '@components/HOC/WithStandardLayout'
import { forumContract } from '@/constant/const'
import { augmentGroupData } from '@/utils/communityUtils'
import { Group } from '@/types/contract/ForumInterface'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { useEffect } from 'react'
import { parseBytes32String } from 'ethers/lib/utils'
import { User } from '@/lib/model'
import { BigNumber } from 'ethers'

export const getStaticProps = async () => {
  if (!forumContract) {
    return { props: { error: 'Forum contract not found' } }
  }
  try {
    const groupCount = await forumContract.groupCount()
    const groups = Array.from({ length: groupCount }, (_, i) => i)

    console.log('groups', groups)

    const rawCommunitiesData = await Promise.all(groups.map(groupId => forumContract.groupAt(groupId)))
    const communitiesData = await Promise.all(rawCommunitiesData.map(rawGroupData => augmentGroupData(rawGroupData)))

    const users = await forumContract.queryFilter(forumContract.filters.NewUser())

    return {
      props: {
        communitiesData: communitiesData as Group[],
        users: users.map(({ args }) => ({
          name: parseBytes32String(args.username),
          groupId: +args.groupId.toString(),
          identityCommitment: args.identityCommitment.toString(),
        })) as User[],
      },
      // Next.js will attempt to re-generate the page:
      // - When a request comes in
      // - At most once every second
      revalidate: 60, // In seconds
    }
  } catch (e) {
    console.error(e)
    return { props: { error: 'An error occurred while fetching data' } }
  }
}

function Home({ communitiesData, users, error }) {
  if (error) {
    return <div>Error: {error}</div>
  }
  const { dispatch } = useCommunityContext()


  useEffect(() => {
    if (!communitiesData || !users) return
    // convert id back to bignumber
    dispatch({ type: 'SET_COMMUNITIES', payload: communitiesData.map(c => ({ ...c, id: BigNumber.from(c.id) })) })
    dispatch({
      type: 'SET_USERS',
      payload: users,
    })
  }, [communitiesData, users])

  console.log('communitiesData', communitiesData)

  return <HomePage isAdmin={false} communities={communitiesData.map(c => ({ ...c, id: BigNumber.from(c.id) }))} users={users} />
}
export default WithStandardLayout(Home)

// For account page
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import type { Group } from '@/types/contract/ForumInterface'
import { isUndefined } from 'lodash'
import { Identity } from '@semaphore-protocol/identity'
import { hasUserJoined } from '@/lib/utils'
import { ActionType } from '@/contexts/CommunityTypes'
import { useCommunityContext } from '@/contexts/CommunityProvider'

export function useCommunitiesJoinedByUser() {
  const { state, dispatch } = useCommunityContext()
  const { address: userAddress } = useAccount()
  const [communitiesJoined, setCommunitiesJoined] = useState<Group[]>([])

  useEffect(() => {
    filterCommunitiesJoinedByUser()
  }, [userAddress, state.communities?.length, state.usersGrouped])

  const filterCommunitiesJoinedByUser = async () => {
    if (userAddress && state.communities?.length) {
      const communitiesJoined: Group[] = []
      await Promise.all(
        state?.communities.map(community => {
          if (isUndefined(state.communitiesJoined[Number(community.id)])) {
            const generatedIdentity = new Identity(userAddress)
            return hasUserJoined({
              groupId: BigInt(community.id),
              identityCommitment: generatedIdentity.commitment,
            }).then(userJoined => {
              if (userJoined) {
                communitiesJoined.push(community)
                dispatch({
                  type: ActionType.UPDATE_COMMUNITIES_JOINED,
                  payload: {
                    communityId: Number(community.id),
                    hasJoined: true,
                  },
                })
              }
            })
          } else if (state.communitiesJoined[Number(community.id)]) {
            return Promise.resolve(communitiesJoined.push(community))
          }
        })
      )
      setCommunitiesJoined(communitiesJoined)
    } else {
      setCommunitiesJoined([])
    }
  }

  return { communitiesJoined }
}

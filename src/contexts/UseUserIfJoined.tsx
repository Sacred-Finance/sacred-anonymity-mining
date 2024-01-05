import { User } from '@/lib/model'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { Identity } from '@semaphore-protocol/identity'
import { hasUserJoined } from '@/lib/utils'
import { ActionType } from '@/contexts/CommunityTypes'
import { useCommunityContext } from '@/contexts/CommunityProvider'

export function useUserIfJoined(communityId: string | number): User | false {
  const numericCommunityId = Number(communityId)
  const { state, dispatch } = useCommunityContext()
  const { address: userAddress } = useAccount()
  const [userJoined, setUserJoined] = useState<User | false>(
    () => state?.communitiesJoined?.[numericCommunityId] || false
  )

  useEffect(() => {
    let isSubscribed = true

    const checkIfUserHasJoined = async () => {
      if (!userAddress) {
        return
      }
      // if numericCommunityId is not set (can be 0)
      if (!numericCommunityId && numericCommunityId != 0) {
        return
      }
      let newUserJoined = state.communitiesJoined[numericCommunityId]

      if (newUserJoined === undefined) {
        const generatedIdentity = new Identity(userAddress)
        const hasJoined = await hasUserJoined({
          groupId: BigInt(numericCommunityId),
          identityCommitment: generatedIdentity.getCommitment(),
        })

        newUserJoined = hasJoined
          ? {
              name: 'anon',
              identityCommitment: generatedIdentity.getCommitment().toString(),
              groupId: numericCommunityId,
              id: '',
            }
          : false

        dispatch({
          type: ActionType.UPDATE_COMMUNITIES_JOINED,
          payload: {
            communityId: numericCommunityId,
            hasJoined: newUserJoined,
          },
        })
      }

      if (isSubscribed && newUserJoined !== userJoined) {
        setUserJoined(newUserJoined)
      }
    }

    checkIfUserHasJoined()

    return () => {
      isSubscribed = false
    }
  }, [userAddress, numericCommunityId, state.communitiesJoined, userJoined, dispatch])

  return userJoined
}

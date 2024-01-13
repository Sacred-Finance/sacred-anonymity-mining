// For account page
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { Group } from '@/types/contract/ForumInterface'
import { Identity } from '@semaphore-protocol/identity'
import { createNote } from '@/lib/utils'
import { useCommunityContext } from '@/contexts/CommunityProvider'

export function useCommunitiesCreatedByUser() {
  const { state } = useCommunityContext()
  const { address: userAddress } = useAccount()
  const [communitiesCreated, setCommunitiesCreated] = useState<Group[]>([])

  useEffect(() => {
    filterCommunitiesCreatedByUser()
  }, [userAddress, state.communities?.length])

  const filterCommunitiesCreatedByUser = async () => {
    if (userAddress && state.communities?.length) {
      const communitiesCreated: Group[] = []
      for (let i = 0; i < state.communities.length; i++) {
        const generatedIdentity = new Identity(userAddress)
        const generatedNote = (await createNote(generatedIdentity)).toString()
        if (state.communities[i].note === generatedNote) {
          communitiesCreated.push(state.communities[i])
        }
      }
      setCommunitiesCreated(communitiesCreated)
    } else {
      setCommunitiesCreated([])
    }
  }

  return { communitiesCreated }
}

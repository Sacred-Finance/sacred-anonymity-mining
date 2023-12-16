import { ActionType, useCommunityContext } from '@/contexts/CommunityProvider'
import { leaveGroup } from '@/lib/api'
import type { User } from '@/lib/model'
import {
  createNote,
  fetchUsersFromSemaphoreContract,
  generateGroth16Proof,
} from '@/lib/utils'
import { Group } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import { useAccount } from 'wagmi'

const username = 'anon'

interface UseLeaveCommunityParams {
  id: bigint
}

export const useLeaveCommunity = ({ id }: UseLeaveCommunityParams) => {
  const { address } = useAccount()
  const { dispatch } = useCommunityContext()

  const prepareGroupAndProof = async (
    userIdentity: Identity,
    groupId: string
  ): Promise<{
    proof: {
      a: string[]
      b: [string[], string[]]
      c: string[]
    }
    siblings: bigint[]
    pathIndices: number[]
  }> => {
    const group = new Group(groupId)
    const users = await fetchUsersFromSemaphoreContract(groupId)
    users.forEach(u => group.addMember(BigInt(u)))
    const index = group.indexOf(BigInt(userIdentity.commitment))

    const { siblings, pathIndices } = group.generateMerkleProof(index)

    const note = await createNote(userIdentity)

    const input = {
      note: note,
      trapdoor: userIdentity.getTrapdoor(),
      nullifier: userIdentity.getNullifier(),
    }

    const proof = await generateGroth16Proof({ input: input })

    return { proof, siblings, pathIndices }
  }

  const leaveCommunity = async () => {
    console.log('Leaving community...')
    if (!address) {
      console.error('No account address found')
      return
    }
    console.log(`address: ${address}`, `id: ${id}`, `username: ${username}`)
    const userIdentity = new Identity(address)
    try {
      console.log('Leaving group...')
      const { proof, siblings, pathIndices } = await prepareGroupAndProof(
        userIdentity,
        id.toString()
      )

      await leaveGroup({
        groupId: id.toString(),
        identityCommitment: userIdentity.commitment.toString(),
        a: proof.a,
        b: proof.b,
        c: proof.c,
        siblings: siblings.map(s => s.toString()),
        pathIndices: pathIndices,
      })

      dispatch({
        type: ActionType.REMOVE_USER,
        payload: {
          groupId: id,
          name: username,
          identityCommitment: userIdentity.getCommitment().toString(),
        } as unknown as User,
      })
    } catch (error) {
      console.error('Error leaving the group:', error)
    }
  }

  return { leaveCommunity }
}

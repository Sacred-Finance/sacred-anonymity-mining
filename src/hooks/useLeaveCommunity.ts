import {
  useActiveUser,
  useCommunityContext,
} from '@/contexts/CommunityProvider'
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

export const useLeaveCommunity = ({ id }) => {
  const activeUser = useActiveUser({ groupId: id })
  const { address } = useAccount()
  const { dispatch } = useCommunityContext() // Use the context hook to access the required context values

  const leaveCommunity = async () => {
    console.log('Leaving group...')

    const userIdentity = new Identity(`${address}_${id}_anon`)
    const group = new Group(id)
    const users = await fetchUsersFromSemaphoreContract(id)
    users.forEach(u => group.addMember(BigInt(u)))
    const index = group.indexOf(BigInt(userIdentity.commitment))
    // group.removeMember(index);

    const { siblings, pathIndices, root } = group.generateMerkleProof(index)

    const note = await createNote(userIdentity)
    const input = {
      note: note,
      trapdoor: userIdentity.getTrapdoor(),
      nullifier: userIdentity.getNullifier(),
    }

    const { a, b, c } = await generateGroth16Proof(
      input,
      '/circuits/VerifyOwner__prod.wasm',
      '/circuits/VerifyOwner__prod.0.zkey'
    )

    return await leaveGroup(
      id,
      userIdentity.commitment.toString(),
      a,
      b,
      c,
      siblings.map(s => s.toString()),
      pathIndices
    ).then(() => {
      console.log('Left group')
      dispatch({
        type: 'REMOVE_USER',
        payload: {
          groupId: id.toString(),
          name: username,
          identityCommitment: userIdentity.getCommitment().toString(),
        } as unknown as User,
      })
    })
  }

  return { leaveCommunity }
}

import { useActiveUser, useCommunityContext, useUsers } from '@/contexts/CommunityProvider'
import { leaveGroup } from '@/lib/api'
import { User } from '@/lib/model'
import { createNote, generateGroth16Proof } from '@/lib/utils'
import { Group } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import { useAccount } from 'wagmi'

const username = 'anon';

export const useLeaveCommunity = ({ id }) => {
  const users = useUsers()
  const activeUser = useActiveUser({ groupId: id })
  const { address } = useAccount()
  const { dispatch } = useCommunityContext() // Use the context hook to access the required context values

  const leaveCommunity = async () => {
    console.log('Leaving group...')

    const userIdentity = new Identity(`${address}_${id}_${activeUser.name}`)
    let group = new Group(id)
    const u = users.filter(u => u?.groupId === +id)
    group.addMembers(u.map(u => u?.identityCommitment))

    const { siblings, pathIndices, root } = group.generateMerkleProof(+id)

    const note = await createNote(userIdentity)
    let input = {
      note: note,
      trapdoor: userIdentity.getTrapdoor(),
      nullifier: userIdentity.getNullifier(),
    }

    const { a, b, c } = await generateGroth16Proof(
      input,
      '/circuits/VerifyOwner__prod.wasm',
      '/circuits/VerifyOwner__prod.0.zkey'
    )

    return await leaveGroup(id, activeUser.identityCommitment.toString(), a, b, c, siblings.map(s => s.toString()), pathIndices).then(() => {
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

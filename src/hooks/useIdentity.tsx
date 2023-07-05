import { useAccount } from 'wagmi'
import { Identity } from '@semaphore-protocol/identity'

interface Created {
  groupId?: string | undefined
  postId?: string | undefined
}

export const useIdentity = ({ groupId, postId }: Created = { groupId: undefined, postId: undefined }) => {
  const { address, isConnected } = useAccount()

  try {
    if (!address || !isConnected) {
      return
    }

    let identityString = address
    if (groupId) {
      // const generatedIdentity = new Identity(`${address}_${c.groupId}_${u.name}`)
      identityString = `${identityString}_${groupId}_anon`
    }
    return new Identity(identityString)
  } catch (e) {
    console.error('error in useIdentity', e)
    return new Identity()
  }
}

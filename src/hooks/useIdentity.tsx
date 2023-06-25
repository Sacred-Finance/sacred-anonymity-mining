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
      identityString = `${identityString}_${groupId}`
    }

    const user = new Identity(address as string)
    const user2 = new Identity(identityString as string)
    const user3 = new Identity(`${identityString}_anon`)

    console.log('user', user.getCommitment().toString())
    console.log('user2', user2.getCommitment().toString())
    console.log('user3', user3.getCommitment().toString())
    return user.getCommitment().toString()
  } catch (e) {
    console.error('error in useIdentity', e)
    return ''
  }
}

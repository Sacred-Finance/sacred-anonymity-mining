import { useAccount } from 'wagmi'
import { Identity } from '@semaphore-protocol/identity'

interface Created {
  groupId?: string | undefined
}
export const useIdentity = ({ groupId }: Created = {}) => {
  const { address, isConnected } = useAccount()

  // Return early if not connected or address is not available.
  if (!isConnected || !address) {
    return null // Return null explicitly for better predictability.
  }

  // Use template strings for better readability.
  const identityString = groupId ? `${address}_${groupId}_anon` : address

  try {
    return new Identity(identityString)
  } catch (e) {
    console.error('Error in useIdentity:', e)
    return null // Return null instead of an empty Identity for error cases.
  }
}

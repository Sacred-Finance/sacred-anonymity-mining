import { useAccount } from 'wagmi'
import { Identity } from '@semaphore-protocol/identity'

export const useIdentity = () => {
  const { address, isConnected } = useAccount()

  // Return early if not connected or address is not available.
  if (!isConnected || !address) {
    return null // Return null explicitly for better predictability.
  }

  try {
    return new Identity(address)
  } catch (e) {
    console.error('Error in useIdentity:', e)
    return null // Return null instead of an empty Identity for error cases.
  }
}

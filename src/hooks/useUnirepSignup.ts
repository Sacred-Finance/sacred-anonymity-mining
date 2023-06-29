import { Identity } from '@semaphore-protocol/identity'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { UnirepUser } from '../lib/unirep'

export const useUnirepSignUp = ({ name, groupId }) => {
  const { address } = useAccount()
  useEffect(() => {
    if (!address || !name || !groupId) return

    const generatedIdentity = new Identity(`${address}_${groupId}_${name}`)

    console.log(generatedIdentity)

    try {
      new UnirepUser(generatedIdentity)

    } catch (error) {
        console.log(error)
    }

  }, [address, groupId, name])
}

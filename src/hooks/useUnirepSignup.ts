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

    // instantiating UnirepUser class, checks if the user is signed up or not, otherwise it signs up the user
    new UnirepUser(generatedIdentity)
  }, [address, groupId, name])
}

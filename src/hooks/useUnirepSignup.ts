import { Identity } from '@semaphore-protocol/identity'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { UnirepUser } from '../lib/unirep'

export const useUnirepSignUp = ({ name, groupId }) => {
  const { address } = useAccount()
  const [unirepUser, setUnirepUser] = useState<UnirepUser>()
  useEffect(() => {
    if (!address || !name || !groupId) return

    const generatedIdentity = new Identity(`${address}_${groupId}_${name}`)

    try {
      const unirepUser = new UnirepUser(generatedIdentity)
      setUnirepUser(unirepUser)
    } catch (error) {
      console.log(error)
    }
  }, [address, groupId, name])

  return unirepUser
}

import { Identity } from '@semaphore-protocol/identity'
import { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { UnirepUser } from '../lib/unirep'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { serializeUserData } from '@/utils/communityUtils'

export const useUnirepSignUp = ({ name, groupId }) => {
  const { address } = useAccount()
  const [unirepUser, setUnirepUser] = useLocalStorage<UnirepUser | null>(`${address}_${groupId}_${name}`, null)

  useEffect(() => {
    if (!address || !name || !groupId) return
    // we still need to reset didload if groupId or name changes
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

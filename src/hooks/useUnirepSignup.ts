import { Identity } from '@semaphore-protocol/identity'
import { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { UnirepUser } from '../lib/unirep'

export const useUnirepSignUp = ({ name, groupId }) => {
  const { address } = useAccount()
  const [unirepUser, setUnirepUser] = useState<UnirepUser>()

  const didLoad = useRef(undefined)
  useEffect(() => {
    if (!address || !name || !groupId) return

    if (didLoad.current === groupId) return
    // we still need to reset didload if groupId or name changes
    didLoad.current = groupId



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

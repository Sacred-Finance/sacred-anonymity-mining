import { Identity } from '@semaphore-protocol/identity'
import { useEffect } from 'react'
import { useAccount, useConnect, useNetwork } from 'wagmi'
import { UnirepUser } from '../lib/unirep'
import _ from 'lodash'

export const useUnirepSignUp = ({ name, groupId }) => {
  const { address } = useAccount()
  useEffect(() => {
    if (!address || !name || isNaN(groupId)) {
      console.log('address, name, groupId', !address, !name, isNaN(groupId))
      return
    }
    const generatedIdentity = new Identity(`${address}_${groupId}_${name}`)

    console.log('generatedIdentity', generatedIdentity)

    const user = new UnirepUser(generatedIdentity)
    console.log('generatedIdentity user', user)

    signUp(generatedIdentity)
      .then(e => {
        console.log('signed up', e)
      })
      .catch(error => {
        console.error(error)
      })
  }, [address, groupId, name])

  const signUp = async generatedIdentity => {
    try {
      const user = new UnirepUser(generatedIdentity as Identity)
      const res = await user.signup()
      console.log(res)
    } catch (error) {
      console.error(error)
    }
  }
}

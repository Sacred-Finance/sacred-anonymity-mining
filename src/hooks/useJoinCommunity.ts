import { useCallback } from 'react'
import { Identity } from '@semaphore-protocol/identity'

import { joinGroup } from '../lib/api'
import { useHandleCommunityAction } from './useHandleCommunityAction'
import { useCommunityContext } from '../contexts/CommunityProvider'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import _ from 'lodash'
import { User } from '../lib/model' // Import the CommunityProvider context hook
import { createNote } from '@/lib/utils'

export const useJoinCommunity = () => {
  const { address, isConnected } = useAccount()

  const { dispatch } = useCommunityContext() // Use the context hook to access the required context values
  const handleCommunityAction = useHandleCommunityAction()

  return useCallback(
    async (groupName: string, groupId: string | number | ethers.BigNumber, successCallback?: () => void) => {
      if (!isConnected || !address || typeof groupId === 'undefined' || isNaN(<number>groupId) || !groupName) {
        console.error('Missing required parameters', isConnected, address, groupId, groupName)
        return
      }

      const actionFn = async () => {
        const username = 'anon'
        const freshUser = new Identity(`${address}_${groupId}_${username}`)
        const note = await createNote(freshUser)
        try {
          // Attempt to join the community
          const joinResponse = await joinGroup(
            groupId.toString(),
            freshUser.getCommitment().toString(),
            username,
            note.toString()
          )
          // Call the prependUser function from the context provider instead of dispatching the action

          dispatch({
            type: 'ADD_USER',
            payload: {
              groupId: +groupId.toString(),
              name: username,
              identityCommitment: freshUser.getCommitment().toString(),
            } as unknown as User,
          })

          if (successCallback) {
            successCallback()
          }
          return joinResponse
        } catch (error) {
          // If the transaction fails, roll back the state update by calling the removeUser function from the context provider
          //@ts-ignore

          dispatch({
            type: 'REMOVE_USER',
            payload: {
              groupId: +groupId.toString(),
              name: username,
              identityCommitment: freshUser.getCommitment().toString(),
            } as unknown as User,
          })
          return error
        }
      }

      return await handleCommunityAction(actionFn, [], `Successfully joined ${groupName}`, successCallback)
    },
    [isConnected, address, handleCommunityAction, dispatch] // Update the dependencies array
  )
}

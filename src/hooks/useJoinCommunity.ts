import { useCallback } from 'react'
import { Identity } from '@semaphore-protocol/identity'
import { joinGroup } from '@/lib/api'
import { useHandleCommunityAction } from './useHandleCommunityAction'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { useAccount } from 'wagmi'
import { createNote } from '@/lib/utils'
import type { User } from '@/lib/model'
import { ActionType } from '@/contexts/CommunityTypes'
import type { BigNumberish } from '@semaphore-protocol/group'

export const useJoinCommunity = () => {
  const { address, isConnected } = useAccount()
  const { dispatch } = useCommunityContext()
  const handleCommunityAction = useHandleCommunityAction()

  // Improved parameter validation
  const isValidGroupId = (groupId: BigNumberish): boolean => {
    return typeof groupId !== 'undefined' && !isNaN(Number(groupId))
  }

  // Extracted action logic into a separate function
  const performJoinCommunity = async (
    groupId: BigNumberish,
    groupName: string,
    username: string = 'anon'
  ): Promise<any> => {
    const freshUser = new Identity(address)
    const note = await createNote(freshUser)
    try {
      const joinResponse = await joinGroup(
        groupId.toString(),
        freshUser.getCommitment().toString(),
        username,
        note.toString()
      )

      dispatch({
        type: ActionType.ADD_USER,
        payload: {
          groupId: groupId,
          name: username,
          identityCommitment: freshUser.getCommitment().toString(),
        } as User,
      })

      return joinResponse
    } catch (error) {
      dispatch({
        type: ActionType.REMOVE_USER,
        payload: {
          groupId: groupId,
          name: username,
          identityCommitment: freshUser.getCommitment().toString(),
        } as User,
      })
      throw error
    }
  }

  return useCallback(
    async (groupName: string, groupId: BigNumberish, successCallback?: () => void) => {
      if (!isConnected || !address || !isValidGroupId(groupId) || !groupName) {
        console.error('Missing required parameters', isConnected, address, groupId, groupName)
        return
      }

      try {
        const joinResponse = await performJoinCommunity(groupId, groupName)
        if (successCallback) {
          successCallback()
        }
        return joinResponse
      } catch (error) {
        console.error(`Failed to join ${groupName}:`, error)
        throw error
      }
    },
    [isConnected, address, handleCommunityAction, dispatch]
  )
}

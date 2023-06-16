import { useCallback } from 'react'
import { Identity } from '@semaphore-protocol/identity'

import { createGroup } from '../lib/api'
import { useHandleCommunityAction } from './useHandleCommunityAction'
import { uploadThenCacheGroupData } from '../utils/communityUtils'
import { useAccount } from 'wagmi'
import { useCommunityContext } from '../contexts/CommunityProvider'

export const useCreateCommunity = (onCreateGroupClose: () => void) => {
  const handleCommunityAction = useHandleCommunityAction()
  const { address, isConnected } = useAccount()
  const { dispatch } = useCommunityContext()
  return useCallback(
    async ({ name, requirements, bannerFile, logoFile, chainId }) => {
      const actionFn = async () => {
        const user = new Identity(address as string)
        const response = await createGroup(user.getCommitment().toString(), requirements, name, chainId)

        const { status, data } = response

        if (status === 200) {
          if (data.event === 'NewGroupCreated' && data.args) {
            const [groupIdArg, nameArg, creatorIdentityCommitmentArg] = data.args

            const groupIdHex = groupIdArg.hex
            const groupIdInt = parseInt(groupIdHex, 16)

            if (groupIdInt) {
              await uploadThenCacheGroupData({
                groupId: groupIdInt,
                bannerFile: bannerFile,
                logoFile: logoFile,
                groupData: data,
                chainId,
                requirements,
              })
              dispatch({
                type: 'ADD_COMMUNITY',
                payload: {
                  groupId: groupIdInt,
                  name: name,
                  id: +groupIdInt.toString(),
                  userCount: 0,
                  requirements,
                  chainId,
                },
              })
            } else {
              console.log('no id', response, data)
            }
          } else {
            console.error('Unexpected event data:', data)
            throw new Error('Failed to extract event data')
          }
        } else {
          console.error('Unexpected response:', response)
        }
        return response
      }

      await handleCommunityAction(actionFn, [], `${name} created successfully`, onCreateGroupClose)
    },
    [isConnected, address, onCreateGroupClose]
  )
}

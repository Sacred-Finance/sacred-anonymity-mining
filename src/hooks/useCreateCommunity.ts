import { useCallback } from 'react'
import { Identity } from '@semaphore-protocol/identity'

import { createGroup } from '../lib/api'
import { useHandleCommunityAction } from './useHandleCommunityAction'
import { cacheGroupData, uploadImages } from '../utils/communityUtils'
import { useAccount } from 'wagmi'
import { useCommunityContext } from '../contexts/CommunityProvider'

export const useCreateCommunity = (onCreateGroupClose: () => void) => {
  const handleCommunityAction = useHandleCommunityAction()
  const { address, isConnected } = useAccount()
  const { dispatch } = useCommunityContext()

  return useCallback(
    async ({ name, requirements, bannerFile, logoFile, chainId, groupDescription, note }) => {
      const actionFn = async () => {
        const user = new Identity(address as string)

        const [bannerCID, logoCID] = await uploadImages({ bannerFile, logoFile })

        const details = {
          description: groupDescription,
          tags: ['0x0000000000000000000000000000000000000000000000000000000000000000'],
          bannerCID: bannerCID || '0x0000000000000000000000000000000000000000000000000000000000000000',
          logoCID: logoCID || '0x0000000000000000000000000000000000000000000000000000000000000000',
        }
        //todo: tags, bannerCID, logoCID need to be converted to Bytes32

        const response = await createGroup(requirements, name, chainId, details, note.toString())

        const { status, data } = response

        if (status === 200) {
          if (data.event === 'NewGroupCreated' && data.args) {
            const [groupIdArg, nameArg, note] = data.args

            const groupIdHex = groupIdArg.hex
            const groupIdInt = parseInt(groupIdHex, 16)

            if (groupIdInt) {
              const groupData = {
                event: data.event,
                args: data.args,
              }

              await cacheGroupData({
                groupId: groupIdInt,
                details,
                groupData,
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

import { useCallback } from 'react'
import { Identity } from '@semaphore-protocol/identity'

import { createGroup } from '@/lib/api'
import { useHandleCommunityAction } from './useHandleCommunityAction'
import { uploadImages } from '@/utils/communityUtils'
import { useAccount } from 'wagmi'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { constants } from 'ethers'
import { createNote, getBytes32FromIpfsHash, getBytes32FromString } from '@/lib/utils'
import type { CommunityDetails, Requirement } from '@/lib/model'
import type { Group } from '@/types/contract/ForumInterface'
import { ActionType } from "@/contexts/CommunityTypes";

export interface ICreateCommunityArgs extends Partial<Group> {
  name: string
  description: string
  requirements: Requirement[]
  bannerFile?: File | undefined
  logoFile?: File | undefined
  chainId: number
  tags: Group['groupDetails']['tags']
}
export const useCreateCommunity = (onCreateGroupClose: () => void) => {
  const handleCommunityAction = useHandleCommunityAction()
  const { address, isConnected } = useAccount()

  const { dispatch } = useCommunityContext()

  return useCallback(
    async ({ name, requirements, bannerFile, logoFile, chainId, tags, description }: ICreateCommunityArgs) => {
      if (!isConnected || !address) {
        throw new Error('Not connected')
      }
      const actionFn = async () => {
        const user: Identity = new Identity(address as string)
        const note: bigint = await createNote(user)

        const { logoCID, bannerCID } = await uploadImages({
          bannerFile,
          logoFile,
        })
        const communityDetails: CommunityDetails = {
          description: description,
          tags: tags?.map(tag => getBytes32FromString(tag)) || [],
          bannerCID: bannerCID ? getBytes32FromIpfsHash(bannerCID) : constants.HashZero,
          logoCID: logoCID ? getBytes32FromIpfsHash(logoCID) : constants.HashZero,
        }
        const response = await createGroup(requirements, name, chainId, communityDetails, note.toString())
        const { status, data } = response

        if (status === 200) {
          if (data.event === 'NewGroupCreated' && data.args) {
            const [groupIdArg] = data.args

            const groupIdHex = groupIdArg.hex
            const groupIdInt = parseInt(groupIdHex, 16)

            if (groupIdInt) {
              dispatch({
                type: ActionType.ADD_COMMUNITY,
                payload: {
                  groupId: groupIdInt,
                  name: name,
                  id: +groupIdInt.toString(),
                  userCount: 0,
                  requirements,
                  chainId,
                }
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
    [isConnected, address, handleCommunityAction, onCreateGroupClose, dispatch]
  )
}

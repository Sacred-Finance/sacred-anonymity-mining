import { useCallback } from 'react'
import { Identity } from '@semaphore-protocol/identity'

import { createGroup } from '@/lib/api'
import { useHandleCommunityAction } from './useHandleCommunityAction'
import { uploadImages } from '@/utils/communityUtils'
import { useAccount } from 'wagmi'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { constants } from 'ethers'
import { createNote, getBytes32FromIpfsHash, getBytes32FromString } from '@/lib/utils'
import type { CommunityDetails } from '@/lib/model'
import type { Group } from '@/types/contract/ForumInterface'
import { ActionType } from '@/contexts/CommunityTypes'
import { toast } from 'react-toastify'
import type { CreateGroupSchema } from '@components/form/form.schema'
import type { z } from 'zod'

export interface ICreateCommunityArgs {
  name: string
  description: string
  bannerFile?: File | undefined
  logoFile?: File | undefined
  chainId: number
  tokenRequirements?: z.infer<typeof CreateGroupSchema>['tokenRequirements']
  tags: Group['groupDetails']['tags']
  note?: string
}
export const useCreateCommunity = (onCreateGroupClose: () => void) => {
  const handleCommunityAction = useHandleCommunityAction()
  const { address, isConnected } = useAccount()

  const { dispatch } = useCommunityContext()

  return useCallback(
    async ({ name, tokenRequirements, bannerFile, logoFile, chainId, tags, description }: ICreateCommunityArgs) => {
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
          tags: tags?.map(tag => getBytes32FromString(tag)) || [constants.HashZero],
          bannerCID: bannerCID ? getBytes32FromIpfsHash(bannerCID) : constants.HashZero,
          logoCID: logoCID ? getBytes32FromIpfsHash(logoCID) : constants.HashZero,
        }
        const response = await createGroup(name, chainId, communityDetails, note.toString(), tokenRequirements)
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
                  requirements: tokenRequirements,
                  chainId,
                } as unknown as Group,
              })
              toast.success('Community created successfully')
              onCreateGroupClose && onCreateGroupClose()
            } else {
              console.log('no id', response, data)
            }
          } else {
            console.error('Unexpected event data:', data)
            throw new Error('Failed to extract event data')
          }
        } else {
          throw new Error('Failed to create community')
          toast.error('Failed to create community')
        }
        return response
      }
      return await handleCommunityAction(actionFn, [], `${name} created successfully`, onCreateGroupClose)
    },
    [isConnected, address, handleCommunityAction, onCreateGroupClose, dispatch]
  )
}

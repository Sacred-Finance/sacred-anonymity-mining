import { useContractWrite } from 'wagmi'
import { ForumContractAddress } from '../constant/const'
import ForumABI from '../constant/abi/Forum.json'
import type { CommunityId } from '@/contexts/CommunityProvider'
import { ActionType, useCommunityContext } from '@/contexts/CommunityProvider'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import type { Address } from '@/types/common'
import { useState } from 'react'

export const useRemoveGroup = (groupId: CommunityId) => {
  const { dispatch, state } = useCommunityContext()

  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  return useContractWrite({
    address: ForumContractAddress as Address,
    abi: ForumABI.abi,
    functionName: 'removeGroup',
    mode: 'recklesslyUnprepared',
    args: [],
    onError(error, variables, context) {
      toast.error(error.name, {
        autoClose: 7000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        toastId: 'removalFailed',
      })
      setIsLoading(false)
    },
    onSuccess: async (data, variables) => {
      setIsLoading(true)
      await data.wait()

      dispatch({
        type: ActionType.REMOVE_COMMUNITY,
        payload: groupId,
      })

      toast.success('Removed Successfully!', {
        autoClose: 7000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setIsLoading(false)
      if (router.pathname === '/') {
        router.reload()
      } else {
        router.push('/')
      }
    },
  })
}

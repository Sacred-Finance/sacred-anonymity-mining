import { useContractWrite, usePrepareContractWrite } from 'wagmi'
import { ForumContractAddress } from '@/constant/const'
import ForumABI from '../constant/abi/Forum.json'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { ActionType, useCommunityContext } from '@/contexts/CommunityProvider'
import type { BigNumberish } from '@semaphore-protocol/group'

export const useRemoveGroup = (groupId: BigNumberish) => {
  const { dispatch } = useCommunityContext()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { config, error: prepareError } = usePrepareContractWrite({
    address: ForumContractAddress,
    abi: ForumABI.abi,
    functionName: 'removeGroup',
    args: [groupId],
  })

  const { write, error: writeError } = useContractWrite({
    ...config,
    onMutate: () => setIsLoading(true),
    onError: error => {
      toast.error(error.message)
      setIsLoading(false)
    },
    onSuccess: async () => {
      dispatch({ type: ActionType.REMOVE_COMMUNITY, payload: groupId })
      setIsLoading(false)
      await router.push('/')
    },
  })

  return { write, isLoading, prepareError, writeError }
}

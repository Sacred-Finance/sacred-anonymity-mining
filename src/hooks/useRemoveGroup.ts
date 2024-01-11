import { useContractWrite, usePrepareContractWrite } from 'wagmi'
import { ForumContractAddress } from '@/constant/const'
import ForumABI from '../constant/abi/Forum.json'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import type { BigNumberish } from '@semaphore-protocol/group'
import { ActionType } from "@/contexts/CommunityTypes";

export const useRemoveGroup = (groupId: BigNumberish) => {
  const { dispatch } = useCommunityContext()
  const router = useRouter()
  const {
    state: { isAdmin, isModerator },
  } = useCommunityContext()
  const {
    config,
    error: prepareError,
    isLoading,
    isFetching,
    isRefetching,
  } = usePrepareContractWrite({
    address: ForumContractAddress,
    abi: ForumABI.abi,
    functionName: 'removeGroup',
    args: [groupId],
    enabled: isAdmin || isModerator,
  })

  const {
    write,
    error: writeError,
    isLoading: contractLoading,
  } = useContractWrite({
    ...config,
    onMutate: () => {
      console.log('onMutate')
    },
    onError: error => {
      toast.error(error.message)
    },
    onSuccess: async () => {
      dispatch({ type: ActionType.REMOVE_COMMUNITY, payload: groupId })
      await router.push('/')
    },
    onSettled: () => {
      console.log('onSettled')
    },
  })

  return { write, isLoading: isLoading || isFetching || isRefetching || contractLoading, prepareError, writeError }
}

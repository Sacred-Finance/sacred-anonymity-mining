import { useCallback, useState } from 'react'
import { useContractWrite } from 'wagmi'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import ForumABI from '../constant/abi/Forum.json'
import { ForumContractAddress } from '@/constant/const'
import type { GroupDetails } from '@/types/contract/ForumInterface'

export const useAdminEditGroupDetails = (groupId, isAdmin) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  useCommunityContext()

  const {
    write,
    error: writeError,
    isLoading: contractLoading,
  } = useContractWrite({
    address: ForumContractAddress,
    abi: ForumABI.abi,
    functionName: 'setGroupDetails',
    onError: error => {
      toast.error(error.message)
      setIsSubmitting(false)
    },
    onSuccess: async () => {
      toast.success('Group details updated')
      await router.push(`/communities/${groupId}`)
    },
  })

  const editGroupDetails = useCallback(
    async (details: GroupDetails) => {
      if (!isAdmin || !write) return
      setIsSubmitting(true)
      try {
        write({ args: [groupId, details] })
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Error: ${error.message}`)
        }
        setIsSubmitting(false)
      }
    },
    [isAdmin, groupId, write]
  )

  return {
    editGroupDetails,
    isSubmitting,
    isLoading: contractLoading,
    writeError,
  }
}

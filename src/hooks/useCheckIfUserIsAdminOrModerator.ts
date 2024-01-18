import { useAccount, useContractRead } from 'wagmi'
import { ForumContractAddress } from '@/constant/const'
import ForumABI from '../constant/abi/Forum.json'
import { useEffect, useState } from 'react'
import type { Address } from '@/types/common'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { ActionType } from '@/contexts/CommunityTypes'

interface UserRoles {
  isAdmin: boolean | null
  isModerator: boolean | null
}

export const useCheckIfUserIsAdminOrModerator = (checkOnInit = false) => {
  const [userRoles, setUserRoles] = useState<UserRoles>({ isAdmin: null, isModerator: null })
  const { address } = useAccount()
  const { dispatch } = useCommunityContext()

  // Fetching user role data
  const useFetchUserRole = (role: 'Admin' | 'Moderator') =>
    useContractRead({
      abi: ForumABI.abi,
      address: ForumContractAddress as Address,
      functionName: `is${role}`,
      args: [address],
      onError(err: Error) {
        setUserRoles(prev => ({ ...prev, [`is${role}`]: false }))
      },
      onSuccess(data: boolean) {
        setUserRoles(prev => ({ ...prev, [`is${role}`]: data }))
        dispatch({ type: ActionType.SET_USER_ACCESS, payload: { [`is${role}`]: data } })
      },
      // 60 seconds
      cacheTime: 60 * 1000,
    })

  const adminContractRead = useFetchUserRole('Admin')
  const moderatorContractRead = useFetchUserRole('Moderator')

  useEffect(() => {
    if (address && checkOnInit) {
      adminContractRead.refetch()
      moderatorContractRead.refetch()
    }
  }, [address, checkOnInit, adminContractRead.refetch, moderatorContractRead.refetch])

  return {
    isAdmin: address && userRoles.isAdmin,
    isModerator: address && userRoles.isModerator,
    isAdminOrModerator: address && (userRoles.isModerator || userRoles.isAdmin),
    fetchIsAdmin: adminContractRead.refetch,
    fetchIsModerator: moderatorContractRead.refetch,
    isLoading: adminContractRead.isLoading || moderatorContractRead.isLoading,
    isFetched: adminContractRead.isFetched || moderatorContractRead.isFetched,
    isAdminFetchStatus: adminContractRead.fetchStatus,
    isModeratorFetchStatus: moderatorContractRead.fetchStatus,
  }
}

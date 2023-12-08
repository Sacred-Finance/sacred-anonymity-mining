import { useAccount, useContractRead } from 'wagmi'
import { ForumContractAddress } from '../constant/const'
import ForumABI from '../constant/abi/Forum.json'
import { useEffect, useState } from 'react'
import type { Address } from '@/types/common'
import { useCommunityContext } from '@/contexts/CommunityProvider'

export const useCheckIfUserIsAdminOrModerator = (checkOnInit = false) => {
  const [isAdmin, setisAdmin] = useState<boolean | null>(null)
  const [isModerator, setIsModerator] = useState<boolean | null>(null)
  const { address } = useAccount()
  const { dispatch } = useCommunityContext()
  const {
    refetch: fetchIsAdmin,
    isLoading: isLoadingAdmin,
    isFetching: isFetchingAdmin,
    isFetched: isAdminFetched,
    fetchStatus: isAdminFetchStatus,
  } = useContractRead({
    abi: ForumABI.abi,
    address: ForumContractAddress as Address,
    functionName: 'isAdmin',
    args: [address],
    onError(err) {
      setisAdmin(false)
    },
    onSuccess(data: boolean) {
      setisAdmin(data)
      dispatch({ type: 'SET_USER_ACCESS', payload: { isAdmin: data } })
    },
    enabled: false,
  })
  const {
    refetch: fetchIsModerator,
    isLoading: isLoadingModerator,
    isFetching: isFetchingModerator,
    isFetched: isModeratorFetched,
    fetchStatus: isModeratorFetchStatus,
  } = useContractRead({
    abi: ForumABI.abi,
    address: ForumContractAddress as Address,
    functionName: 'isModerator',
    args: [address],
    onError(err) {
      setIsModerator(false)
    },
    onSuccess(data: boolean) {
      // console.log(data);
      setIsModerator(data)
      dispatch({ type: 'SET_USER_ACCESS', payload: { isModerator: data } })
    },
    enabled: false,
  })

  useEffect(() => {
    if (checkOnInit && address) {
      console.log('checkOnInit', checkOnInit)
      fetchIsAdmin()
      fetchIsModerator()
    }
  }, [checkOnInit])

  useEffect(() => {
    if (!address) {
      dispatch({
        type: 'SET_USER_ACCESS',
        payload: { isModerator: false, isAdmin: false },
      })
    } else {
      fetchIsAdmin()
      fetchIsModerator()
    }
  }, [address])

  return {
    isAdmin: address && isAdmin,
    isModerator: address && isModerator,
    fetchIsAdmin,
    fetchIsModerator,
    isLoading: isLoadingAdmin || isLoadingModerator,
    isFetching: isFetchingAdmin || isFetchingModerator,
    isFetched: isAdminFetched || isModeratorFetched,
    isAdminFetchStatus,
    isModeratorFetchStatus,
  }
}

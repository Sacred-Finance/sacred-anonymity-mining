import { useContractRead } from 'wagmi'
import { ForumContractAddress } from '../constant/const'
import ForumABI from '../constant/abi/Forum.json'
import { useState } from 'react'
import {Address} from "@/types/common";

export const useCheckIfUserIsAdminOrModerator = address => {
  const [isAdmin, setisAdmin] = useState<boolean | null>(null)
  const [isModerator, setIsModerator] = useState<boolean | null>(null)
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
    },
    enabled: false,
  })
  return {
    isAdmin,
    isModerator,
    fetchIsAdmin,
    fetchIsModerator,
    isLoading: isLoadingAdmin || isLoadingModerator,
    isFetching: isFetchingAdmin || isFetchingModerator,
    isFetched: isAdminFetched || isModeratorFetched,
    isAdminFetchStatus,
    isModeratorFetchStatus,
  }
}

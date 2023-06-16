import { useContractRead, useContractWrite } from "wagmi";
import { ForumContractAddress } from "../constant/const";
import ForumABI from "../constant/abi/Forum.json";
import { useState } from "react";

export const useFetchAdminsAndModerators = () => {
  const {
    refetch: fetchAdmins,
    isLoading: isLoadingAdmin,
    isFetching: isFetchingAdmin,
    isFetched: isAdminFetched,
  } = useContractRead({
    abi: ForumABI.abi,
    address: ForumContractAddress as `0x${string}`,
    functionName: "getAdmins",
    onError(err) {
      setAdmins([]);
    },
    onSuccess(data) {
      // console.log(data)
      setAdmins(data as string[]);
    },
    // enabled: false
  });
  const {
    refetch: fetchModerators,
    isLoading: isLoadingModerator,
    isFetching: isFetchingModerator,
    isFetched: isModeratorFetched,
  } = useContractRead({
    abi: ForumABI.abi,
    address: ForumContractAddress as `0x${string}`,
    functionName: "getModerators",
    onError(err) {
      setModerators([]);
    },
    onSuccess(data) {
      // console.log(data);
      setModerators(data as string[]);
    },
    // enabled: false
  });

  const [admins, setAdmins] = useState<string[]>([]);
  const [moderators, setModerators] = useState<string[]>([]);

  return {
    admins,
    moderators,
    fetchAdmins,
    fetchModerators,
    isLoading: isLoadingAdmin || isLoadingModerator,
    isFetching: isFetchingAdmin || isFetchingModerator,
    isFetched: isAdminFetched || isModeratorFetched,
  };
};

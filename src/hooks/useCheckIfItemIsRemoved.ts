import { useContractRead } from 'wagmi'
import ForumABI from '../constant/abi/Forum.json'
import { ForumContractAddress } from '../constant/const'
import { useState } from 'react'

export const useCheckIfItemIsRemoved = itemId => {
  const [isPostRemoved, setIsPostRemoved] = useState(false)
  useContractRead({
    abi: ForumABI.abi,
    address: ForumContractAddress as `0x${string}`,
    functionName: 'isItemRemoved',
    args: [itemId],
    onError(err) {
      console.error(err)
      setIsPostRemoved(false)
    },
    onSuccess(data) {
      console.log(data)
      setIsPostRemoved(data as boolean)
    },
  })

  return isPostRemoved
}

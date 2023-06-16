import { ForumContractAddress } from '../constant/const'
import ForumABI from '../constant/abi/Forum.json'
import { polygonMumbai } from 'wagmi/chains'
import { useCommunityContext } from '../contexts/CommunityProvider'
import { useAccount, useContract, useProvider } from 'wagmi'
import { User } from '../lib/model'
import { useEffect } from 'react'
import { parseBytes32String } from 'ethers/lib/utils'

export const useFetchUsers = (loadOnInit = true) => {
  const { dispatch } = useCommunityContext()

  const provider = useProvider({ chainId: polygonMumbai.id })
  const { isConnected } = useAccount()

  const forumContract = useContract({
    address: ForumContractAddress,
    abi: ForumABI.abi,
    signerOrProvider: provider,
  })

  const fetchUsers = async () => {
    if (!forumContract || !provider) {
      console.error('Forum contract not found or provider not found')
      return
    }

    try {
      const users = await forumContract?.queryFilter(forumContract.filters.NewUser())

      dispatch({
        type: 'SET_USERS',
        payload: users.map(
          user =>
            ({
              name: parseBytes32String(user['args'].username),
              groupId: +user['args'].groupId.toString(),
              identityCommitment: user['args'].identityCommitment.toString(),
            } as User)
        ),
      })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (loadOnInit) fetchUsers()
  }, [forumContract, isConnected])

  return fetchUsers
}

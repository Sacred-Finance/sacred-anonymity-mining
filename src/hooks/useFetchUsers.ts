import { ForumContractAddress } from '../constant/const'
import ForumABI from '../constant/abi/Forum.json'
import { polygonMumbai } from 'wagmi/chains'
import { useCommunityContext } from '../contexts/CommunityProvider'
import { useContract, useProvider } from 'wagmi'
import { User } from '../lib/model'
import { useEffect, useRef } from 'react'
import { parseBytes32String } from 'ethers/lib/utils'

export const useFetchUsers = (groupId, loadOnInit = true,) => {
  const { dispatch } = useCommunityContext()


  const provider = useProvider({ chainId: polygonMumbai.id })

  const forumContract = useContract({
    address: ForumContractAddress,
    abi: ForumABI.abi,
    signerOrProvider: provider,
  })

  const fetchUsersFromContract = async () => {
    return await forumContract?.groupUsers(groupId)
  }

  const fetchUsers = async () => {
    if (!forumContract || !provider) {
      console.error('Forum contract not found or provider not found')
      return
    }

    if (!groupId) {
      console.error('Group id not found')
      return
    }

    try {

      const users = await fetchUsersFromContract();

      dispatch({
        type: 'SET_USERS',
        payload: users.map(
          u =>
            ({
              name: 'anon',
              groupId: +groupId,
              identityCommitment: u.toString(),
            } as User)
        ),
      })
    } catch (e) {
      console.error(e)
    }
  }

  const didLoadRef = useRef(false)
  useEffect(() => {
    if (didLoadRef.current) return
    didLoadRef.current = true
    if (loadOnInit) fetchUsers()
  }, [groupId])

  return { fetchUsers, fetchUsersFromContract }
}

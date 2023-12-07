import { ethers, providers } from 'ethers'
import { ForumContractAddress } from '@/constant/const'
import ForumABI from '../constant/abi/Forum.json'

const callContract = async (provider: providers.Provider, address: string, functionName: string) => {
  const contract = new ethers.Contract(ForumContractAddress, ForumABI.abi, provider)
  try {
    const result = await contract[functionName](address)
    return { status: 'success', data: result }
  } catch (error) {
    return { status: 'error', error }
  }
}

export const isAuthValid = async request => {
  // if the url contains admin, then we need to check the contract for the admin address

  if (request.nextUrl.pathname.includes('admin')) {
    // address from url
    let address = request.nextUrl.pathname.split('/')[2]
    // validate address
    if (!ethers.utils.isAddress(address)) {
      return false
    }
    // get chainId
    let chainId = request.nextUrl.pathname.split('/')[3]

    // get provider
    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL, {
      chainId: parseInt(chainId),
    })

    const isAdminResponse = await callContract(provider, address, 'isAdmin')
    const isModeratorResponse = await callContract(provider, address, 'isModerator')

    if (isAdminResponse.status === 'error' || isModeratorResponse.status === 'error') {
      // Handle error
      console.log('Error while checking roles:', isAdminResponse.error, isModeratorResponse.error)
      return false
    }

    const isAdmin = isAdminResponse.data
    const isModerator = isModeratorResponse.data

    if (!isAdmin && !isModerator) {
      return false
    }
  }
  return true
}

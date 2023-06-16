import { useAccount, useContract, useContractWrite, useProvider } from 'wagmi'
import { ForumContractAddress } from '../constant/const'
import ForumABI from '../constant/abi/Forum.json'
import { polygonMumbai } from 'wagmi/chains'
import { getBytes32FromIpfsHash, uploadIPFS } from '../lib/utils'

// TODO: when we need to implement edit item by admin / moderator

const useEditItemAsAdminOrModerator = (itemId, itemType, content) => {
  const provider = useProvider({ chainId: polygonMumbai.id })
  const { address } = useAccount()
  const forumContract = useContract({
    address: ForumContractAddress,
    abi: ForumABI.abi,
    signerOrProvider: provider,
  })
  const editItem = useContractWrite({
    address: ForumContractAddress as `0x${string}`,
    abi: ForumABI.abi,
    functionName: 'editItem',
    mode: 'recklesslyUnprepared',
    onSettled: (data, error) => {},
    onSuccess: async (data, variables) => {},
  })
  const sendEditPostTransaction = async postContent => {
    const item = forumContract.itemAt(itemId)
    let currentDate = new Date()
    const post = JSON.stringify(postContent)
    const message = currentDate.getTime().toString() + '#' + post
    console.log(`Editing your anonymous post...`)
    let cid
    try {
      cid = await uploadIPFS(message)
      if (!cid) {
        throw Error('Upload to IPFS failed')
      }

      console.log(`IPFS CID: ${cid}`)
      const signal = getBytes32FromIpfsHash(cid)
    } catch (error) {
      // this.undoNewPost(groupId, cid);
      throw error
    }
    editItem.write()
  }
  return { ...editItem }
}

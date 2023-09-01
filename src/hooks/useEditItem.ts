import { useAccount, useContractWrite, useProvider } from 'wagmi'
import { ForumContractAddress } from '../constant/const'
import ForumABI from '../constant/abi/Forum.json'
import { polygonMumbai } from 'wagmi/chains'
import { generateGroth16Proof, getBytes32FromIpfsHash, uploadIPFS } from '../lib/utils'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import { Post } from '@/lib/post'
import { CommentClass } from '@/lib/comment'
import { User } from '@/lib/model'
import { Identity } from '@semaphore-protocol/identity';
import { mutate } from 'swr'
import { getGroupWithPostAndCommentData } from '@/lib/fetcher'

export const useEditItem = (postId, groupId, isAdminOrModerator, setIsLoading) => {
  const { address } = useAccount()
  const member = useUserIfJoined(groupId)
  const postInstance = new Post(postId, groupId)
  const commentInstance = new CommentClass(groupId, postId, null)
  const { writeAsync } = useContractWrite({
    address: ForumContractAddress as `0x${string}`,
    abi: ForumABI.abi,
    functionName: 'editItem',
    mode: 'recklesslyUnprepared',
    onSettled: (data, error) => {},
    onSuccess: async (data, variables) => {},
  })
  const { t } = useTranslation();

  const validateRequirements = () => {
    if (!address) return toast.error(t('toast.error.notLoggedIn'), { type: 'error', toastId: 'min' })
    if (!member) return toast.error(t('toast.error.notJoined'), { type: 'error', toastId: 'min' })

    return true
  }

  const editItem = async (content, itemId, itemType, note) => {
    if (itemType !== 0 && itemType !== 1 && itemType !== 2) return toast.error(t('alert.deleteFailed'))
    if (validateRequirements() !== true) return

    if (isAdminOrModerator) {
      let currentDate = new Date()
      const post = JSON.stringify(content)
      const message = currentDate.getTime().toString() + '#' + post
      console.log(`Editing your anonymous post...`)
      let cid
      try {
        cid = await uploadIPFS(message)
        if (!cid) {
          throw Error('Upload to IPFS failed')
        }
        console.log(`IPFS CID: ${cid}`)
        const signal = getBytes32FromIpfsHash(cid);
        const userPosting = new Identity(`${address}_${groupId}_${member?.name}`)
        let input = {
          trapdoor: userPosting.getTrapdoor(),
          note: BigInt(note),
          nullifier: userPosting.getNullifier(),
        }
    
        const { a, b, c } = await generateGroth16Proof(
          input,
          '/circuits/VerifyOwner__prod.wasm',
          '/circuits/VerifyOwner__prod.0.zkey'
        )
        return writeAsync({
          recklesslySetUnpreparedArgs: [a, b, c, itemId, signal],
        }).then(async (value) => {
          return await value.wait().then(async() => {
            await mutate(getGroupWithPostAndCommentData(groupId, postId))
          })
        })
      } catch (error) {
        // this.undoNewPost(groupId, cid);
        throw error
      }
    } else {
      return itemType === 0 ?? itemType === 2
        ? postInstance?.edit(        
          content,
          address,
          itemId,
          member as User,
          groupId,
          setIsLoading)
        : commentInstance?.edit(content, address, itemId, member as User, groupId, setIsLoading)
    }
  }
  return { editItem }
}

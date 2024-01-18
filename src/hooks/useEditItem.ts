import { useAccount, useContractWrite } from 'wagmi'
import { ForumContractAddress } from '@/constant/const'
import { generateGroth16Proof, getBytes32FromIpfsHash, uploadIPFS } from '@/lib/utils'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { Post } from '@/lib/post'
import { CommentClass } from '@/lib/comment'
import type { PostContent, User } from '@/lib/model'
import { ContentType } from '@/lib/model'
import { Identity } from '@semaphore-protocol/identity'
import { mutate } from 'swr'
import { GroupPostCommentAPI } from '@/lib/fetcher'
import type { Address } from '@/types/common'
import type { Item } from '@/types/contract/ForumInterface'
import type { BigNumberish } from '@semaphore-protocol/group'
import { useUserIfJoined } from '@/contexts/UseUserIfJoined'
import { abi } from '@/constant/abi'

interface UseEditItemParams {
  item: Item
  commentId?: BigNumberish
  isAdminOrModerator: boolean
  setIsLoading: (isLoading: boolean) => void
}

export interface EditItemParams {
  content: PostContent
  itemId: BigNumberish
  itemType: ContentType
  note: number
}

export const useEditItem = ({
  item,
  isAdminOrModerator,
  setIsLoading,
}: UseEditItemParams): {
  editItem: ({ content, itemId, itemType, note }: EditItemParams) => Promise<
    | {
        wait: () => Promise<void>
      }
    | undefined
    | void
  >
} => {
  const { groupId, parentId, id, kind } = item

  const postId = parentId ? parentId : id
  const commentId = kind == ContentType.COMMENT ? id : null
  const { address } = useAccount()
  const member = useUserIfJoined(groupId)
  const postInstance = new Post(postId, groupId)
  const commentInstance = commentId ? new CommentClass(groupId, postId, commentId) : null

  const { writeAsync } = useContractWrite({
    address: ForumContractAddress as Address,
    abi: abi,
    functionName: 'editItem',
  })
  const { t } = useTranslation()

  const validateRequirements = () => {
    if (!address) {
      return toast.error(t('toast.error.notLoggedIn'), {
        type: 'error',
        toastId: 'min',
      })
    }
    if (!member && !isAdminOrModerator) {
      console.log('not joined')
      return toast.error(t('toast.error.notJoined'), {
        type: 'error',
        toastId: 'min',
      })
    }

    return true
  }

  const editItem = async ({ content, itemId, itemType, note }: EditItemParams) => {
    if (!ContentType[itemType]) {
      return
    }
    if (validateRequirements() !== true) {
      return
    }

    if (!address) {
      return toast.error(t('toast.error.notLoggedIn'), {
        type: 'error',
        toastId: 'min',
      })
    }
    if (isAdminOrModerator) {
      // todo: this function currently fails for admins
      try {
        const currentDate = new Date()
        const post = JSON.stringify(content)
        const message = currentDate.getTime().toString() + '#' + post
        const cid = await uploadIPFS(message)
        if (!cid) {
          throw Error('Upload to IPFS failed')
        }

        const signal = getBytes32FromIpfsHash(cid)

        const userPosting = new Identity(address)
        const input = {
          trapdoor: userPosting.getTrapdoor(),
          note: BigInt(note),
          nullifier: userPosting.getNullifier(),
        }

        const { a, b, c } = await generateGroth16Proof({ input })
        return writeAsync
          ? writeAsync({
              args: [[a], [b], [c], [itemId], [signal], [cid]],
            }).then(async value => {
              await mutate(GroupPostCommentAPI(groupId, postId))
            })
          : null
      } catch (error) {
        console.error(error)
        return toast.error(t('alert.editFailed'))
      }
    } else {
      return itemType == 0 || itemType == 2
        ? postInstance?.edit({
            postContent: content,
            address: address,
            itemId: itemId,
            postedByUser: member as User,
            groupId: groupId,
            setWaiting: setIsLoading,
          })
        : commentInstance?.edit({ commentContent: content, address, itemId: itemId })
    }
  }
  return { editItem }
}

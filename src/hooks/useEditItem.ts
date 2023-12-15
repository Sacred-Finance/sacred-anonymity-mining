import { useAccount, useContractWrite } from 'wagmi'
import { ForumContractAddress } from '@/constant/const'
import ForumABI from '../constant/abi/Forum.json'
import {
  generateGroth16Proof,
  getBytes32FromIpfsHash,
  uploadIPFS,
} from '@/lib/utils'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import type { CommunityId } from '@/contexts/CommunityProvider'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import { Post } from '@/lib/post'
import { CommentClass } from '@/lib/comment'
import type { PostContent, User } from '@/lib/model'
import { ContentType } from '@/lib/model'
import { Identity } from '@semaphore-protocol/identity'
import { mutate } from 'swr'
import { GroupPostCommentAPI } from '@/lib/fetcher'
import type { Address } from '@/types/common'
import type { Item } from '@/types/contract/ForumInterface'

interface UseEditItemParams {
  item: Item
  commentId?: CommunityId
  isAdminOrModerator: boolean
  setIsLoading: (isLoading: boolean) => void
}

export interface EditItemParams {
  content: PostContent
  itemId: number
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

  const postId = parentId && +parentId > 0 ? parentId : id
  const commentId = kind == ContentType.COMMENT ? id : null
  const { address } = useAccount()
  const member = useUserIfJoined(groupId)
  const postInstance = new Post(postId, groupId)
  const commentInstance = commentId
    ? new CommentClass(groupId, postId, commentId)
    : null

  const { writeAsync } = useContractWrite({
    address: ForumContractAddress as Address,
    abi: ForumABI.abi,
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
    if (!member) {
      return toast.error(t('toast.error.notJoined'), {
        type: 'error',
        toastId: 'min',
      })
    }

    return true
  }

  const editItem = async ({
    content,
    itemId,
    itemType,
    note,
  }: EditItemParams) => {
    if (!ContentType[itemType]) {
      return toast.error(t('alert.deleteFailed'))
    }
    if (validateRequirements() !== true) {
      return
    }

    if (isAdminOrModerator) {
      const currentDate = new Date()
      const post = JSON.stringify(content)
      const message = currentDate.getTime().toString() + '#' + post
      let cid
      try {
        cid = await uploadIPFS(message)
        if (!cid) {
          throw Error('Upload to IPFS failed')
        }
        console.log(`IPFS CID: ${cid}`)
        const signal = getBytes32FromIpfsHash(cid)
        if (!member) {
          throw Error('Member not found')
        }
        const userPosting = new Identity(
          `${address}_${groupId}_${member?.name}`
        )
        const input = {
          trapdoor: userPosting.getTrapdoor(),
          note: BigInt(note),
          nullifier: userPosting.getNullifier(),
        }

        const { a, b, c } = await generateGroth16Proof({ input: input })
        return writeAsync
          ? writeAsync({
              recklesslySetUnpreparedArgs: [a, b, c, itemId, signal],
            }).then(async value => {
              return await value.wait().then(async () => {
                await mutate(GroupPostCommentAPI(groupId, postId))
              })
            })
          : null
      } catch (error) {
        // this.undoNewPost(groupId, cid);
        throw error
      }
    } else {
      return itemType == 0 || itemType == 2
        ? postInstance?.edit(
            content,
            address,
            itemId,
            member as User,
            groupId,
            setIsLoading
          )
        : commentInstance?.edit(
            content,
            address,
            itemId,
            member as User,
            groupId,
            setIsLoading
          )
    }
  }
  return { editItem }
}

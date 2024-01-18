import { mutate } from 'swr'
import { useAccount, useContractWrite } from 'wagmi' // import from the right location
import ForumABI from '@/constant/abi/Forum.json'
import { forumContract, ForumContractAddress } from '@/constant/const'
import { toast } from 'react-toastify'
import { Post } from '@/lib/post'
import { CommentClass } from '@/lib/comment'
import { useTranslation } from 'react-i18next'
import type { PostContent, User } from '@/lib/model'
import { ContentType } from '@/lib/model'
import { GroupPostCommentAPI } from '@/lib/fetcher'
import type { Address } from '@/types/common'
import { useCallback } from 'react'
import { useUserIfJoined } from '@/contexts/UseUserIfJoined'
import type { BigNumberish } from '@semaphore-protocol/group'
import { BigNumberishToBigInt, BigNumberishToNumber } from '@/utils/communityUtils'
import type { WriteContractResult } from '@wagmi/core'

interface UseRemoveItemFromForumContractParams {
  groupId: BigNumberish
  postId: BigNumberish
  isAdminOrModerator: boolean
  setIsLoading: (isLoading: boolean) => void
}

export const useRemoveItemFromForumContract = ({
  groupId,
  postId,
  isAdminOrModerator,
  setIsLoading,
}: UseRemoveItemFromForumContractParams) => {
  const { address } = useAccount()
  const member = useUserIfJoined(groupId)
  const postInstance = new Post(postId, groupId)
  const commentInstance = new CommentClass(groupId, postId)
  const { t } = useTranslation()

  const validateRequirements = useCallback(
    (address: string | undefined, member: User | false): address is string => {
      if (!address) {
        toast.error(t('toast.error.notLoggedIn'), {
          type: 'error',
          toastId: 'min',
        })
        return false
      }
      if (!member) {
        toast.error(t('toast.error.notJoined'), {
          type: 'error',
          toastId: 'min',
        })
        return false
      }

      return true
    },
    [address, member]
  )

  const deleteItem = async (itemId: BigNumberish, itemType: ContentType) => {
    if (Number(itemType) != ContentType.POST && itemType != ContentType.POLL && itemType != ContentType.COMMENT) {
      return toast.error(t('toast.error.invalidItemType'), {
        type: 'error',
        toastId: 'min',
      })
    }

    if (!validateRequirements(address, member)) {
      return
    }

    if (isAdminOrModerator) {
      return writeAsync
        ? writeAsync({
            args: [BigNumberishToBigInt(itemId)],
          }).then(async value => {
            return await mutate(GroupPostCommentAPI(groupId, postId))
          })
        : null
    } else {
      return itemType == ContentType.POST ?? itemType == ContentType.POLL
        ? postInstance?.delete(address, itemId)
        : commentInstance?.delete(address, itemId)
    }
  }

  const onSuccess = async (
    data: WriteContractResult,
    variables: {
      args: [BigNumberish]
    }
  ) => {
    try {
      const itemId = variables.args[0]
      const item = (await forumContract.read.itemAt([BigNumberishToBigInt(itemId)])) as unknown as PostContent
      if (item.kind == ContentType.COMMENT) {
        await handleCommentItem(BigNumberishToNumber(itemId))
      }
      setIsLoading(false)
    } catch (error) {
      console.log(error)
      setIsLoading(false)
    }
  }

  const handleCommentItem = async (itemId: number) => {
    await mutate(
      commentInstance.commentsCacheId(),
      data => {
        const commentsListCopy = [...data]
        const i = commentsListCopy.findIndex(c => +c.id == itemId)
        commentsListCopy.splice(i, 1)
        return commentsListCopy
      },
      { revalidate: false }
    )
  }

  const { data, writeAsync } = useContractWrite({
    args: undefined,
    request: undefined,
    address: ForumContractAddress as Address,
    abi: ForumABI.abi,
    functionName: 'removeItem',
    onSuccess,
  })

  return { data, deleteItem }
}

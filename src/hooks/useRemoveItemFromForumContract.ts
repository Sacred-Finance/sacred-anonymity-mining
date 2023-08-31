import { mutate } from 'swr'
import { setCacheAtSpecificPath } from '@/lib/redis'
import { useAccount, useContractWrite } from 'wagmi' // import from the right location
import ForumABI from '@/constant/abi/Forum.json'
import { ForumContractAddress, forumContract } from '@/constant/const'
import { toast } from 'react-toastify'
import { useUserIfJoined, useUsers } from '@/contexts/CommunityProvider'
import { Post } from '@/lib/post'
import { CommentClass } from '@/lib/comment'
import { useTranslation } from 'react-i18next'
import { User } from '@/lib/model'
import { getGroupWithPostAndCommentData } from '@/lib/fetcher'

export const useRemoveItemFromForumContract = (
  groupId,
  postId,
  isAdminOrModerator,
  setIsLoading,
) => {
  const { address } = useAccount()
  const users = useUsers()
  const member = useUserIfJoined(groupId)
  const postInstance = new Post(postId, groupId)
  const commentInstance = new CommentClass(groupId, postId, null)
  const { t } = useTranslation();

  const onSettled = (data, error) => {
    console.log('test-log', { data, error })
  }

  const validateRequirements = () => {
    if (!address) return toast.error(t('toast.error.notLoggedIn'), { type: 'error', toastId: 'min' })
    if (!member) return toast.error(t('toast.error.notJoined'), { type: 'error', toastId: 'min' })

    return true
  }

  const deleteItem = async (itemId, itemType: number) => {
    if (itemType !== 0 && itemType !== 1 && itemType !== 2) return toast.error(t('alert.deleteFailed'))
    if (validateRequirements() !== true) return
    if (isAdminOrModerator) {
      return writeAsync({
        recklesslySetUnpreparedArgs: [+itemId],
      }).then(async (value) => {
        return await value.wait().then(async() => {
          await mutate(getGroupWithPostAndCommentData(groupId, postId))
        })
      })
    } else {
      return itemType === 0 ?? itemType === 2
        ? postInstance?.delete(address, itemId, users, member as User, groupId, setIsLoading)
        : commentInstance?.delete(address, itemId, users, member as User, groupId, setIsLoading)
    }
  }

  const onSuccess = async (data, variables) => {
    try {
      const tx = await data.wait()
      const itemId = variables.args[0]
      const item = await forumContract.itemAt(itemId)
      if (item.kind == 0 || item.kind == 2) {
        await setCacheAtSpecificPath(postInstance?.specificId(itemId), true, '$.removed')
      } else if (item.kind == 1) {
        await handleCommentItem(itemId)
      }
      setIsLoading(false)
    } catch (error) {
      console.log(error)
      setIsLoading(false)
    }
  }

  const handleCommentItem = async itemId => {
    await setCacheAtSpecificPath(commentInstance.specificId(itemId), true, '$.removed')
    mutate(
      commentInstance.commentsCacheId(),
      data => {
        const commentsListCopy = [...data]
        const i = commentsListCopy.findIndex(c => +c.id === itemId)
        commentsListCopy.splice(i, 1)
        return commentsListCopy
      },
      { revalidate: false }
    )
  }

  const { data, writeAsync } = useContractWrite({
    address: ForumContractAddress as `0x${string}`,
    abi: ForumABI.abi,
    functionName: 'removeItem',
    mode: 'recklesslyUnprepared',
    onSettled,
    onSuccess,
  })

  return { data, deleteItem }
}

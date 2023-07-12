// useRemoveItemFromForumContract.js
import { mutate } from 'swr'
import { setCacheAtSpecificPath } from '@/lib/redis'
import { useContractWrite } from 'wagmi' // import from the right location

export const useRemoveItemFromForumContract = (
  ForumContractAddress,
  ForumABI,
  forumContract,
  postInstance,
  commentClassInstance,
  setIsLoading
) => {
  const onSettled = (data, error) => {
    console.log('test-log', { data, error })
    setIsLoading(false)
  }

  const onSuccess = async (data, variables) => {
    try {
      const tx = await data.wait()
      const itemId = variables.args[0]
      const item = await forumContract.itemAt(itemId)
      if (item.kind == 0) {
        await setCacheAtSpecificPath(postInstance?.current?.specificPostId(itemId), true, '$.removed')
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
    await setCacheAtSpecificPath(commentClassInstance.current.specificCommentId(itemId), true, '$.removed')
    mutate(
      commentClassInstance.current.commentsCacheId(),
      data => {
        const commentsListCopy = [...data]
        const i = commentsListCopy.findIndex(c => +c.id === itemId)
        commentsListCopy.splice(i, 1)
        return commentsListCopy
      },
      { revalidate: false }
    )
  }

  const { data, write } = useContractWrite({
    address: ForumContractAddress as `0x${string}`,
    abi: ForumABI.abi,
    functionName: 'removeItem',
    mode: 'recklesslyUnprepared',
    onSettled,
    onSuccess,
  })

  return { data, write }
}

import React from 'react'
import { PrimaryButton } from './PrimaryButton'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useRemoveItemFromForumContract } from '@/hooks/useRemoveItemFromForumContract'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

const DeleteItemButton = ({ itemId, itemType, groupId, postId, isAdminOrModerator }) => {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { deleteItem } = useRemoveItemFromForumContract(groupId, postId, isAdminOrModerator, setIsSubmitting)
  const router = useRouter();

  const onDelete = async () => {
    setIsSubmitting(true)
    console.log(itemId)
    try {
      const result = await deleteItem(itemId, itemType)
      toast.success(t('alert.deleteSuccess'))
      setIsSubmitting(false);

      if (itemType == 0 || itemType == 2) {
        router.push(`/communities/${groupId}`)
      }
      console.log(result)
    } catch (error) {
      console.log(error)
      toast.error(error.message ?? error)
      setIsSubmitting(false)
    }
  }

  return (
    <PrimaryButton
      isLoading={isSubmitting}
      className={clsx(
        'w-fit bg-red-500 hover:bg-red-600 text-white',
        'border-gray-500 border text-sm text-gray-500 transition-colors duration-150 hover:bg-gray-500 hover:text-white'
      )}
      onClick={() => {
        onDelete()
      }}
    >
      {t('button.delete')}
    </PrimaryButton>
  )
}

export default DeleteItemButton

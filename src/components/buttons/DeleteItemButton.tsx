import React, { useState } from 'react'
import { PrimaryButton } from './PrimaryButton'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useRemoveItemFromForumContract } from '@/hooks/useRemoveItemFromForumContract'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { ContentType } from '@/lib/model'
import { CustomModal } from '@components/CustomModal'
import {TrashIcon} from "@heroicons/react/20/solid";

const DeleteItemButton = ({ itemId, itemType, groupId, isAdminOrModerator }) => {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { deleteItem } = useRemoveItemFromForumContract(groupId, itemId, isAdminOrModerator, setIsSubmitting)
  const router = useRouter()
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const onDelete = async () => {
    setIsSubmitting(true)
    try {
      const result = await deleteItem(itemId, itemType)
      toast.success(t('alert.deleteSuccess'))
      setIsSubmitting(false)

      if (itemType === ContentType.POST || itemType === ContentType.POLL) {
        router.push(`/communities/${groupId}`)
      }
      console.log(result)
    } catch (error) {
      console.log(error)
      toast.error(error.message ?? error)
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirmation = () => {
    setIsModalOpen(false)
    onDelete()
  }

  return (
      <>
        <PrimaryButton
            isLoading={isSubmitting}
            className={clsx(
                'bg-red-500 text-white border-red-500 hover:bg-red-600 focus:outline-none focus:border-red-700 focus:ring focus:ring-red-200 dark:bg-red-600 dark:hover:bg-red-700',
                'text-sm transition-colors duration-150'
            )}
            onClick={() => setIsModalOpen(true)}
            startIcon={<TrashIcon className="h-4 w-4" />}
            loadingPosition={'start'}
        >
          {t('button.delete')}
        </PrimaryButton>

        <CustomModal
            isOpen={isModalOpen}
            setIsOpen={isOpen => {
              setIsModalOpen(isOpen);
              setDeleteConfirmation('');
            }}
        >
          <div className="overflow-hidden rounded-lg bg-blue-500 dark:bg-blue-600">
            <div className="flex h-60 w-80 flex-col items-center gap-4 rounded-2xl p-9 selection:bg-blue-300 dark:selection:bg-blue-700">
              <div className="text-2xl font-bold text-white">Are you Sure?</div>
              <div className="text-center text-white">This action cannot be undone.</div>
              <input
                  className="w-full bg-white dark:bg-gray-800 p-2 rounded text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700"
                  onChange={e => setDeleteConfirmation(e.target.value)}
                  placeholder='Type "delete" to confirm'
              />
            </div>

            <div className="flex w-full items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-b-lg">
              <PrimaryButton
                  className="bg-gray-500 text-white hover:bg-gray-600 focus:outline-none focus:border-gray-600 focus:ring focus:ring-gray-200 dark:bg-gray-600 dark:hover:bg-gray-700"
                  onClick={() => {
                    setIsModalOpen(false);
                    setDeleteConfirmation('');
                  }}
              >
                {t('button.cancel')}
              </PrimaryButton>
              <PrimaryButton
                  disabled={deleteConfirmation !== 'delete'}
                  className="bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:border-red-600 focus:ring focus:ring-red-200 dark:bg-red-600 dark:hover:bg-red-700"
                  onClick={handleDeleteConfirmation}
              >
                Delete
              </PrimaryButton>
            </div>
          </div>
        </CustomModal>
      </>

  )
}

export default DeleteItemButton

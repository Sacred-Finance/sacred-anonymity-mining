import React, { useState } from 'react'
import { PrimaryButton } from './PrimaryButton'
import { useTranslation } from 'react-i18next'
import { useRemoveItemFromForumContract } from '@/hooks/useRemoveItemFromForumContract'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { ContentType } from '@/lib/model'
import { CustomModal } from '@components/CustomModal'
import { TrashIcon } from '@heroicons/react/20/solid'
import { Group } from '@/types/contract/ForumInterface'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shad/ui/dialog'
import { Input } from '@/shad/ui/input'

const DeleteItemButton = ({
  itemId,
  itemType,
  groupId,
  isAdminOrModerator,
}: {
  itemId: string
  itemType: ContentType
  groupId: Group['groupId']
  isAdminOrModerator: boolean
}) => {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { deleteItem } = useRemoveItemFromForumContract({
    groupId: groupId,
    postId: itemId,
    isAdminOrModerator: isAdminOrModerator,
    setIsLoading: setIsSubmitting,
  })
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
    } catch (error: unknown) {
      // Correctly typed as unknown
      if (error instanceof Error) {
        // Safely assumed to be an Error object, can access message property.
        toast.error(error.message)
      } else {
        // Handle the case where it's not an Error object.
        // You could log this case or display a generic error message.
        toast.error('An unexpected error occurred.')
      }
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirmation = () => {
    setIsModalOpen(false)
    onDelete()
  }

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <PrimaryButton
            isLoading={isSubmitting}
            className="bg-red-500 text-white hover:bg-red-600 z-2"
            onClick={() => setIsModalOpen(true)}
            startIcon={<TrashIcon className="h-5 w-5" />}
          >
            {t('button.delete')}
          </PrimaryButton>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className={'space-y-4'}>
            <DialogTitle>Are you sure absolutely sure?</DialogTitle>
          </DialogHeader>{' '}
          <DialogDescription>
            <Input
              onChange={e => setDeleteConfirmation(e.target.value)}
              placeholder='Type "delete" to confirm'
            />
          </DialogDescription>
          <DialogFooter>
            <PrimaryButton
              disabled={deleteConfirmation !== 'delete'}
              onClick={handleDeleteConfirmation}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DeleteItemButton

import React, { useState } from 'react'
import { PrimaryButton } from './PrimaryButton'
import { useTranslation } from 'react-i18next'
import { useRemoveItemFromForumContract } from '@/hooks/useRemoveItemFromForumContract'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { ContentType } from '@/lib/model'
import { TrashIcon } from '@heroicons/react/20/solid'
import type { Group } from '@/types/contract/ForumInterface'
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
import { CircularLoader } from '@components/CircularLoader'
import { BigNumberish } from '@semaphore-protocol/group'

const DeleteItemButton = ({
  itemId,
  itemType,
  groupId,
  isAdminOrModerator,
}: {
  itemId: BigNumberish
  itemType: ContentType
  groupId: Group['groupId']
  isAdminOrModerator: boolean
}) => {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      await deleteItem(itemId, itemType)
      setIsSubmitting(false)

      if (itemType === ContentType.POST || itemType === ContentType.POLL) {
        router.push(`/communities/${groupId}`)
      }
    } catch (error: unknown) {
      // @devs: This is a type guard, it checks if the error is an instance of Error.
      // we should do this for all errors that are not typed.
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
    onDelete()
  }

  return (
    <>
      <Dialog>
        <DialogTrigger className="z-[2] flex  h-full items-stretch gap-2 rounded-md bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600">
          {isSubmitting && <CircularLoader />}
          <TrashIcon className="h-5 w-5" />
          {t('button.delete')}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="space-y-4">
            <DialogTitle>Are you sure absolutely sure?</DialogTitle>
          </DialogHeader>{' '}
          <DialogDescription>
            <Input onChange={e => setDeleteConfirmation(e.target.value)} placeholder='Type "delete" to confirm' />
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

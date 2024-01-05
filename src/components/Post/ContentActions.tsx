import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Item } from '@/types/contract/ForumInterface'
import { PrimaryButton } from '@components/buttons'
import { PaperAirplaneIcon, PencilIcon } from '@heroicons/react/20/solid'
import DeleteItemButton from '@components/buttons/DeleteItemButton'
import { XCircleIcon } from 'lucide-react'
import type { BigNumberish } from '@semaphore-protocol/group'
import type { ContentType } from '@/lib/model'

interface EditActionProps {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  isEditing: boolean
  isLoading: boolean
}
export const EditAction: React.FC<EditActionProps> = ({ setIsEditing, isEditing, isLoading }) => {
  const { t } = useTranslation()
  return (
    <PrimaryButton
      isLoading={isLoading}
      className="w-fit bg-blue-500 text-sm text-white hover:bg-blue-600"
      onClick={() => setIsEditing(!isEditing)}
      startIcon={<PencilIcon className="mr-1 h-4 w-4" />}
    >
      {t('button.edit')}
    </PrimaryButton>
  )
}

// Delete Action Component
interface DeleteActionProps {
  isAdminOrModerator: boolean
  itemId: BigNumberish
  itemType: ContentType
  groupId: BigNumberish
}
export const DeleteAction: React.FC<DeleteActionProps> = ({ isAdminOrModerator, itemId, itemType, groupId }) => (
  <DeleteItemButton isAdminOrModerator={isAdminOrModerator} itemId={itemId} itemType={itemType} groupId={groupId} />
)

// Save Action Component
interface SaveActionProps {
  onSave: () => void
  isLoading: boolean
  item: Item // Replace 'Item' with the actual type of your item
}
export const SaveAction: React.FC<SaveActionProps> = ({ onSave, isLoading, item }) => {
  const { t } = useTranslation()
  return (
    <PrimaryButton
      className="bg-blue-500 text-sm text-white hover:bg-blue-500/80"
      isLoading={isLoading}
      disabled={!item || (!item.description?.blocks?.length && !item.blocks?.length)}
      onClick={onSave}
      startIcon={<PaperAirplaneIcon className="mr-1 h-4 w-4" />}
    >
      {t('button.save')}
    </PrimaryButton>
  )
}

// Cancel Action Component
interface CancelActionProps {
  onCancel: () => void
}
export const CancelAction: React.FC<CancelActionProps> = ({ onCancel }) => {
  const { t } = useTranslation()
  return (
    <PrimaryButton
      className="bg-red-500 text-sm text-white hover:bg-red-500/80"
      startIcon={<XCircleIcon className="mr-1 h-4 w-4" />}
      onClick={onCancel}
    >
      {t('button.cancel')}
    </PrimaryButton>
  )
}

import DeleteItemButton from '@components/buttons/DeleteItemButton'
import { PrimaryButton } from '@components/buttons'
import {
  PaperAirplaneIcon,
  PencilIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid'
import React from 'react'
import { useTranslation } from 'react-i18next'
import type { Group, Item } from '@/types/contract/ForumInterface'
import clsx from 'clsx'

export const ContentActions = ({
  group,
  isContentEditable,
  onContentPage,
  item,
  groupId,
  isAdminOrModerator,
  setIsContentEditing,
  isEditing,
  onClickCancel,
  refreshData,
  save,
  isLoading,
  hidden,
}: {
  group: Group
  isContentEditable: boolean
  onContentPage: boolean
  item: Item
  groupId: number
  contentId: number
  isAdminOrModerator: boolean
  setIsContentEditing: React.Dispatch<React.SetStateAction<boolean>>
  isEditing: boolean
  onClickCancel: () => void
  save: () => void
  isLoading: boolean
  hidden: boolean
  refreshData?: () => void
}) => {
  const { t } = useTranslation()
  if (hidden) {
    return null
  }
  if (isContentEditable && onContentPage) {
    return (
      <>
        <div className="flex items-center gap-2 will-change-transform">
          {!isEditing && (
            <>
              <PrimaryButton
                isLoading={isLoading}
                className="w-fit bg-blue-500 text-sm text-white hover:bg-blue-600"
                onClick={() => setIsContentEditing(!isEditing)}
                startIcon={<PencilIcon className="mr-1 h-4 w-4" />}
                loadingPosition="start"
              >
                {t('button.edit')}
              </PrimaryButton>
              <DeleteItemButton
                isAdminOrModerator={isAdminOrModerator}
                itemId={item.id}
                itemType={item.kind}
                groupId={groupId}
              />
            </>
          )}
          {isEditing && (
            <>
              <PrimaryButton
                className="bg-blue-500 text-sm text-white hover:bg-blue-500/80"
                isLoading={isLoading}
                disabled={
                  !item ||
                  (!item.description?.blocks?.length && !item.blocks?.length)
                }
                onClick={() => save()}
                startIcon={<PaperAirplaneIcon className="mr-1 h-4 w-4" />}
                loadingPosition="start"
              >
                {t('button.save')}
              </PrimaryButton>
              <PrimaryButton
                className={clsx(
                  'bg-red-500 hover:bg-red-500/80',
                  'border text-sm transition-colors duration-150 hover:text-white',
                  'text-slate-200'
                )}
                startIcon={<XCircleIcon className="mr-1 h-4 w-4" />}
                loadingPosition="start"
                onClick={() => onClickCancel()}
              >
                {t('button.cancel')}
              </PrimaryButton>
            </>
          )}
        </div>
      </>
    )
  }
  return null
}

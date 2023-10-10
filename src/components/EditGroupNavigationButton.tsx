import React, { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

import { createNote } from '@/lib/utils'
import { Identity } from '@semaphore-protocol/identity'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import ToolTip from '@components/HOC/ToolTip'

export const useCheckIsOwner = (community, address) => {
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    checkIsOwner().then(setIsOwner)
  }, [address])

  const checkIsOwner = async () => {
    if (!address) return false
    if (!community?.note) return false
    const user = new Identity(address as string)
    const note = await createNote(user)
    return community.note.toString() === note.toString()
  }

  return { isOwner }
}

function EditGroupNavigationButton({ community }) {
  const { address } = useAccount()
  const { t } = useTranslation()

  const { isOwner } = useCheckIsOwner(community, address)

  if (!isOwner) return null

  return (
    <ToolTip tooltip={t('toolTip.editCommunity.title')} direction={'left'}>
      <Link
        id="edit-community-button"
        className={`absolute right-0 z-20 rounded-full bg-gray-200 p-2 transition-all duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 ${
          !isOwner ? 'hidden' : ''
        }`}
        aria-label="edit community"
        href={`/communities/${community.groupId}/edit`}
      >
        <svg
          fill="none"
          stroke="currentColor"
          className="h-5 w-5 text-gray-700 transition-colors dark:text-gray-300"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          />
        </svg>
      </Link>
    </ToolTip>
  )
}

export default EditGroupNavigationButton

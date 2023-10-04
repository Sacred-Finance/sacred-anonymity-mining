import { useTranslation } from 'next-i18next'

import React from 'react'
import Image from 'next/image'
import { PrimaryButton } from '@components/buttons'

export const NoPosts = ({ onClick, children }: { onClick?: () => void; children?: React.ReactNode }) => {
  const { t } = useTranslation()

  return (
    <div
      onClick={onClick}
      className={
        'font-bold flex h-96 select-none w-full flex-col items-center justify-center rounded border p-2 text-center text-xl '
      }
    >
      {t('noPostsFound')}
      {children}
    </div>
  )
}

export const NoComments = ({ onClick, children }: { onClick?: () => void; children?: React.ReactNode }) => {
  const { t } = useTranslation()

  return (
    <div
      onClick={onClick}
      className={
        'font-bold absolute inset-0 flex h-96 select-none flex-col items-center justify-center rounded border p-2 text-center text-xl '
      }
    >
      {t('noCommentsFound')}
      {children}
    </div>
  )
}

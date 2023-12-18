import { useTranslation } from 'next-i18next'

import React from 'react'

export const NoPosts = ({
  onClick,
  children,
}: {
  onClick?: () => void
  children?: React.ReactNode
}) => {
  const { t } = useTranslation()

  return (
    <div onClick={onClick}>
      {t('noPostsFound')}
      {children}
    </div>
  )
}

export const NoComments = ({
  onClick,
  children,
}: {
  onClick?: () => void
  children?: React.ReactNode
}) => {
  const { t } = useTranslation()

  return (
    <div
      onClick={onClick}
      className="absolute inset-0 flex h-96 select-none flex-col items-center justify-center rounded border p-2 text-center text-xl font-bold "
    >
      {t('noCommentsFound')}
      {children}
    </div>
  )
}

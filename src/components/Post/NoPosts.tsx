import { useTranslation } from 'next-i18next'

import React from 'react'

export const NoPosts = ({ onClick, children }: { onClick?: () => void; children?: React.ReactNode }) => {
  const { t } = useTranslation()
  return (
    <div onClick={onClick}>
      {t('noPostsFound')}
      {children}
    </div>
  )
}

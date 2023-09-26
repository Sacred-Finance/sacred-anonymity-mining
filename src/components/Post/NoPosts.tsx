import { useTranslation } from 'next-i18next'

export const NoPosts = () => {
  const { t } = useTranslation()

  return (
    <div className={'rounded border p-2 text-center'}>
      <span className={'bold text-xl'}>{t('noPostsFound')}</span>
    </div>
  )
}

export const NoComments = ({ onClick, children }: { onClick?: () => void; children?: React.ReactNode }) => {
  const { t } = useTranslation()

  return (
    <div
      onClick={onClick}
      className={
        'bold absolute inset-0 flex h-96 select-none flex-col items-center justify-center rounded border p-2 text-center text-xl '
      }
    >
      {t('noCommentsFound')}
      {children}
    </div>
  )
}

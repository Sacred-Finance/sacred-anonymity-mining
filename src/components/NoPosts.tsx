import { useTranslation } from 'next-i18next'

export const NoPosts = () => {
  const { t } = useTranslation()

  return (
    <div className={'rounded border p-2 text-center'}>
      <span className={'bold text-xl'}>{t('noPostsFound')}</span>
    </div>
  )
}

export const NoComments = () => {
  const { t } = useTranslation()

  return (
    <div className={'rounded border p-2 text-center'}>
      <span className={'bold text-xl'}>{t('noCommentsFound')}</span>
    </div>
  )
}

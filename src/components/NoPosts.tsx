import { useTranslation } from 'next-i18next';

export const NoPosts = () => {
  const { t } = useTranslation();

  return (
    <div className={'py-2 rounded border'}>
      <span className={'text-xl bold'} >
        {t("noPostsFound")}
      </span>
    </div>
  );
};

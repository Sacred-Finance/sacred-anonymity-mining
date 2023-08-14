import { Logo } from './Logo'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

const ListHeader = ({ children }) => {
  return <p className="mb-2 text-lg font-semibold text-gray-200 dark:text-gray-200">{children}</p>
}

export default function Footer(): JSX.Element {
  const { t, ready } = useTranslation()

  if (!ready) return <> </>

  return (
    <footer className="w-full border-t border-gray-700 bg-gray-800 py-4 dark:bg-gray-900">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        <div className="flex flex-col items-center space-y-3">
          <ListHeader>{t('footer.followUs')}</ListHeader>
          <a href="http://discord.gg/43spxvqqmJ" className="text-gray-300 hover:text-purple-500">
            {t('footer.discord')}
          </a>
          <a href="https://twitter.com/SacredLogos" className="text-gray-300 hover:text-purple-500">
            {t('footer.twitter')}
          </a>
          <a href="https://t.me/SacredLogosOfficial" className="text-gray-300 hover:text-purple-500">
            {t('footer.telegram')}
          </a>
          <a href="https://sacredlogos.medium.com/" className="text-gray-300 hover:text-purple-500">
            {t('footer.medium')}
          </a>
        </div>
        <div className="flex flex-col items-center space-y-3">
          <ListHeader>{t('footer.legal')}</ListHeader>
          <a
            href="https://sacred-finance.github.io/Sacred_Privacy_Policy.pdf"
            className="text-gray-300 hover:text-purple-500"
          >
            {t('footer.privacyPolicy')}
          </a>
          <a
            href="https://sacred-finance.github.io/Sacred_Terms_of_Service.pdf"
            className="text-gray-300 hover:text-purple-500"
          >
            {t('footer.termsOfService')}
          </a>
        </div>
      </div>
      <div className="container mx-auto mt-8 border-t border-gray-700 px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <Logo invertTheme={true}  />
        </div>
        <p className="pt-6 text-center text-sm text-gray-300">© 2023 Sacred.</p>
      </div>
    </footer>
  )
}

import { Logo } from './Logo'
import { useTranslation } from 'next-i18next'

export default function Footer(): JSX.Element {
  const { t, ready } = useTranslation()

  if (!ready) {
    return <> </>
  }

  return (
    <footer className="justify-self-end bg-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8 lg:px-16">
        <div className="md:flex md:justify-between">
          <div className="mb-6 flex items-center md:mb-0">
            <Logo width={400} invertTheme={true} className=" mr-3" />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-xl font-semibold text-white">{t('footer.followUs')}</h2>
              <ul className="font-medium text-gray-500 dark:text-gray-400">
                <li className="mb-4">
                  <a href="https://discord.gg/43spxvqqmJ" className="hover:text-purple-500">
                    {t('footer.discord')}
                  </a>
                </li>
                <li className="mb-4">
                  <a href="https://twitter.com/SacredLogos" className="hover:text-purple-500">
                    {t('footer.twitter')}
                  </a>
                </li>

                <li>
                  <a href="https://sacredlogos.medium.com/" className="hover:text-purple-500">
                    {t('footer.medium')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Section */}
            <div>
              <h2 className="mb-6 text-xl font-semibold text-white">{t('footer.legal')}</h2>
              <ul className="font-medium text-gray-500 dark:text-gray-400">
                <li className="mb-4">
                  <a
                    href="https://sacred-finance.github.io/Sacred_Privacy_Policy.pdf"
                    className="hover:text-purple-500"
                  >
                    {t('footer.privacyPolicy')}
                  </a>
                </li>
                <li>
                  <a
                    href="https://sacred-finance.github.io/Sacred_Terms_of_Service.pdf"
                    className="hover:text-purple-500"
                  >
                    {t('footer.termsOfService')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-700 sm:mx-auto lg:my-8 dark:border-gray-900" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-white">
            © 2023 SacredLogos. All Rights Reserved.
          </span>
          {/* Add additional social icons if necessary */}
        </div>
      </div>
    </footer>
  )
}

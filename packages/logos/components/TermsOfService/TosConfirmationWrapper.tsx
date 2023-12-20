import React, { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useTranslation } from 'next-i18next'

interface TosConfirmationWrapperProps {
  buttonElement: React.ReactElement
  headerText: string
  descriptionText: string
  onAgree: () => void
  validationBeforeOpen?: () => Promise<boolean>
}

export const TosConfirmationWrapper: React.FC<TosConfirmationWrapperProps> = ({
  buttonElement,
  headerText,
  descriptionText,
  onAgree,
  validationBeforeOpen,
}) => {
  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [isChecked, setIsChecked] = useState(false)

  const handleAgree = () => {
    if (isChecked) {
      onAgree()
      setIsOpen(false)
    }
  }

  const clonedButtonElement = React.cloneElement(buttonElement, {
    onClick: async () => {
      if (validationBeforeOpen) {
        const result = await validationBeforeOpen()
        if (result === false) return
      }
      setIsOpen(true)
    },
  })

  return (
    <>
      {clonedButtonElement}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
            as="div"
            className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto"
            onClose={() => setIsOpen(false)}
        >
          <Dialog.Overlay className="fixed inset-0 bg-black dark:bg-white opacity-30" />

          <div className="z-50 inline-block w-full max-w-md transform transition-transform bg-white dark:bg-gray-900 shadow-xl rounded-lg overflow-hidden">
            <Dialog.Title className="flex items-center justify-between p-6 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-semibold">
              <span>{headerText}</span>
              <button onClick={() => setIsOpen(false)} className="focus:outline-none">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-6 w-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Title>

            <Dialog.Description className="p-6 text-gray-600 dark:text-gray-300">
              <div className="mb-4">{descriptionText}</div>
              <a
                  className="text-blue-500 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 mb-4 block"
                  href="https://sacred-finance.github.io/Sacred_Terms_of_Service.pdf"
                  target="_blank"
                  rel="noreferrer"
              >
                {t('termsOfService.viewTermsOfService')}
              </a>

              <div className="flex items-center mt-2">
                <input
                    id="agree"
                    type="checkbox"
                    checked={isChecked}
                    onChange={e => setIsChecked(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-0 mr-2"
                />
                <label htmlFor={'agree'} className="">{t('termsOfService.agreeCheckBox')}</label>
              </div>
            </Dialog.Description>

            <div className="p-6 bg-gray-200 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700">
              <button
                  onClick={handleAgree}
                  className={`rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none transition-colors ${
                      isChecked ? '' : 'cursor-not-allowed opacity-50'
                  }`}
              >
                {t('termsOfService.agreeAndProceed')}
              </button>
            </div>
          </div>
        </Dialog>
      </Transition>

    </>
  )
}

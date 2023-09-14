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
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="z-50 inline-block w-full max-w-md transform overflow-hidden rounded bg-white text-left align-middle shadow-xl transition-all">
            <Dialog.Title className="flex items-center justify-between rounded-t bg-gray-50 p-6 font-semibold text-gray-900">
              <span>{headerText}</span>
              <button onClick={() => setIsOpen(false)} className="focus:outline-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-6 w-6 text-gray-600 hover:text-gray-900"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Title>

            <Dialog.Description className="px-6 py-4 text-gray-600">
              <div className="">{descriptionText}</div>
              <a
                className="text-purple-600 underline hover:text-purple-900"
                href="https://sacred-finance.github.io/Sacred_Terms_of_Service.pdf"
                target="_blank"
                rel="noreferrer"
              >
                {t('termsOfService.viewTermsOfService')}
              </a>

              <div className="">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={e => setIsChecked(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-0"
                  />
                  <span className="">{t('termsOfService.agreeCheckBox')}</span>
                </label>
              </div>
            </Dialog.Description>

            <div className="rounded-b bg-gray-50 px-6 py-4">
              <button
                onClick={handleAgree}
                className={`rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none ${
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

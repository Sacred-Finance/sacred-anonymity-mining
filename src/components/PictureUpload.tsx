import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { ToolTip } from './HOC/ToolTip'
import { useHandleFileImageUpload } from '../utils/communityUtils'
import clsx from 'clsx'
import { primaryButtonStyle } from '../styles/classes'
import { motion } from 'framer-motion'
export const PictureUpload = (props: {
  uploadedImageUrl?: string
  displayName: string
  name: 'banner' | 'logo'
  setImageFileState: Dispatch<SetStateAction<File | null>>
}) => {
  const handleFileImageUpload = useHandleFileImageUpload(props.setImageFileState)

  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [isDeleteIconVisible, setIsDeleteIconVisible] = useState(false)
  const openFileUpload = () => {
    if (props.uploadedImageUrl) return
    inputRef.current?.click()
  }

  useEffect(() => {
    if (!imageRef.current) return

    // on hover show edit button
    const showDeleteIcon = () => {
      setIsDeleteIconVisible(true)
    }
    const hideDeleteIcon = () => {
      setIsDeleteIconVisible(false)
    }

    imageRef.current.addEventListener('mouseenter', showDeleteIcon)
    imageRef.current.addEventListener('mouseleave', hideDeleteIcon)

    return () => {
      imageRef.current?.removeEventListener('mouseenter', showDeleteIcon)
      imageRef.current?.removeEventListener('mouseleave', hideDeleteIcon)
    }
  }, [])

  return (
    <>
      <div ref={imageRef} className="relative flex w-full max-w-[650px] justify-center sm:w-full">
        {props.uploadedImageUrl ? (
          <>
            <img
              className="rounded-lg"
              style={{
                opacity: isDeleteIconVisible ? 0.5 : 1,
              }}
              width={props.name === 'banner' ? '100%' : 200}
              height={props.name === 'banner' ? '100%' : 200}
              onClick={() => {
                props.setImageFileState(null)
                if (!inputRef.current) return
                inputRef.current.value = ''
              }}
              src={props.uploadedImageUrl}
              alt=""
            />

            {isDeleteIconVisible && (
              <div
                className={
                  'absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] group-hover:text-error-dark'
                }
              >
                {/* trash icon svg */}
                <svg
                  className="h-6 w-6 cursor-pointer text-inherit"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  onClick={() => {
                    props.setImageFileState(null)
                    if (!inputRef.current) return
                    inputRef.current.value = ''
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </>
        ) : (
          <div
            className={clsx(
              'group pointer-events-auto flex h-[200px] flex-col items-center justify-center rounded border-2 border-dashed border-border-on-dark',
              props.name === 'banner' ? 'sm:w-screen md:w-[624px]' : ' w-[200px]'
            )}
          >
            <button
              className={clsx(
                `h-100 bg-primary-500py-2 cursor-pointer select-none items-center rounded-lg text-center transition-colors duration-200 ease-in-out group-hover:bg-primary-light`,
                props.uploadedImageUrl ? 'brightness-80 filter' : '',
                primaryButtonStyle,
                'border-none'
              )}
              onClick={openFileUpload}
            >
              <span className="flex items-center justify-center">
                {props.uploadedImageUrl ? (
                  <>
                    {t('display', { displayName: props.displayName })}
                    {/*svg checkmark icon*/}
                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    {t('upload', { displayName: props.displayName })}
                    <motion.svg
                      key="spinner"
                      animate={{ rotate: 360 }}
                      transition={{ loop: Infinity, duration: 2 }}
                      className="group-hover:spin-reverse ml-2 h-5 w-5 cursor-pointer rounded-full border text-inherit transition-colors duration-200 ease-in-out"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </motion.svg>
                  </>
                )}
              </span>
              <input
                hidden={true}
                ref={inputRef}
                type="file"
                name={props.name}
                accept="image/jpeg, image/png, image/jpg, image/webp, image/gif, image/svg+xml, image/avif"
                onChange={handleFileImageUpload}
              />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

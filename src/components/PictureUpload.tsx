import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { ToolTip } from './HOC/ToolTip'
import { useHandleFileImageUpload } from '../utils/communityUtils'
import clsx from 'clsx'

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
      <div ref={imageRef} className="relative">
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
                inputRef.current!.value = ''
                props.setImageFileState(null)
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
                    inputRef.current!.value = ''
                    props.setImageFileState(null)
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
              'group pointer-events-auto h-[200px] rounded border-2 border-dashed border-border-on-dark',
              props.name === 'banner' ? 'w-[624px]' : ' w-[200px]'
            )}
          >
            <button
              className={`h-full w-full cursor-pointer select-none rounded-lg bg-brand px-4 py-2 text-center text-on-dark-high-emphasis hover:bg-primary-light dark:text-on-light-high-emphasis ${
                props.uploadedImageUrl ? 'brightness-80 filter' : ''
              }`}
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
                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
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

import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useHandleFileImageUpload } from '@/utils/communityUtils'
import type { HandleSetImage } from '@pages/communities/[groupId]/edit'
import Image from 'next/image'

export const PictureUpload = (props: {
  uploadedImageUrl: string | undefined
  displayName: string
  name: 'banner' | 'logo'
  setImageFileState: ({ file, imageType }: HandleSetImage) => void
}) => {
  const handleFileImageUpload = useHandleFileImageUpload(props.setImageFileState)

  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [isDeleteIconVisible, setIsDeleteIconVisible] = useState(false)
  const openFileUpload = () => {
    if (props.uploadedImageUrl) {
      return
    }
    inputRef.current?.click()
  }

  useEffect(() => {
    if (!imageRef.current) {
      return
    }

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
      <div
        ref={imageRef}
        className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-100 hover:text-white  dark:bg-gray-900"
      >
        {props.uploadedImageUrl ? (
          <>
            <Image
              width={500}
              height={500}
              className="h-52 w-full object-contain transition-opacity"
              style={{ opacity: isDeleteIconVisible ? 0.5 : 1 }}
              onFocus={() => setIsDeleteIconVisible(true)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setIsDeleteIconVisible(true)
                }
              }}
              onClick={() => {
                props.setImageFileState({
                  imageType: props.name,
                  file: undefined,
                })
                if (!inputRef.current) {
                  return
                }
                inputRef.current.value = ''
              }}
              src={props.uploadedImageUrl}
              alt="Uploaded"
            />
            {isDeleteIconVisible && (
              <button
                className="absolute inset-0 flex h-full w-full items-center justify-center"
                onClick={() => {
                  props.setImageFileState({
                    imageType: props.name,
                    file: undefined,
                  })
                  if (!inputRef.current) {
                    return
                  }
                  inputRef.current.value = ''
                }}
              >
                <svg
                  className="h-10 w-10 cursor-pointer text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </>
        ) : (
          <button
            className="group flex h-52 w-full cursor-pointer items-center  justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-100 px-6 hover:text-white  dark:bg-gray-900"
            onClick={openFileUpload}
          >
            <div className="flex items-center justify-center text-lg">
              {t('upload', { displayName: props.displayName })}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="ms-5 h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <input
              hidden
              ref={inputRef}
              type="file"
              name={props.name}
              accept="image/jpeg, image/png, image/jpg, image/webp, image/gif, image/svg+xml, image/avif"
              onChange={handleFileImageUpload}
            />
          </button>
        )}
      </div>
    </>
  )
}

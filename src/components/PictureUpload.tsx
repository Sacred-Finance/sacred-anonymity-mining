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

  const [hovered, setHovered] = useState(0)
  return (
    <>
      <div
        ref={imageRef}
        className="relative flex aspect-1  h-full max-h-64 w-full items-center  justify-center  overflow-hidden rounded-lg"
      >
        {props.uploadedImageUrl ? (
          <>
            <img
              className="h-full w-full object-contain transition-opacity "
              style={{ opacity: isDeleteIconVisible ? 0.5 : 1 }}
              onClick={() => {
                props.setImageFileState(null)
                if (!inputRef.current) return
                inputRef.current.value = ''
              }}
              src={props.uploadedImageUrl}
              alt="Uploaded"
            />
            {isDeleteIconVisible && (
              <div className="absolute inset-0 flex items-center justify-center ">
                <svg
                  className="h-full w-full  cursor-pointer text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  onClick={() => {
                    props.setImageFileState(null)
                    if (!inputRef.current) return
                    inputRef.current.value = ''
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </>
        ) : (
          <div
            className={`group flex h-52 w-full cursor-pointer items-center  justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-100 hover:bg-primary-300  hover:text-white`}
            onClick={openFileUpload}
            onMouseOver={() => setHovered(hovered+45)}
            onMouseLeave={() => setHovered(hovered+45)}
          >
            <div
              className="flex items-center justify-center "

            >

              <>
                {t('upload', { displayName: props.displayName })}
                <motion.svg
                  key="spinner"
                  animate={{ rotate: hovered}}
                  exit={{ rotate: 0 }}
                  transition={{ loop: Infinity, duration: 0.5 }}
                  className="ml-2 h-5 w-5 cursor-pointer rounded-full text-gray-500 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </motion.svg>
              </>
              {/*)}*/}
            </div>
            <input
              hidden
              ref={inputRef}
              type="file"
              name={props.name}
              accept="image/jpeg, image/png, image/jpg, image/webp, image/gif, image/svg+xml, image/avif"
              onChange={handleFileImageUpload}
            />
          </div>
        )}
      </div>
    </>
  )
}

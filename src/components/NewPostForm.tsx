import { useTranslation } from 'react-i18next'
import React, { ChangeEvent, RefObject, useEffect, useRef, useState } from 'react'
import EditorJsRenderer from './editor-js/EditorJSRenderer'
import { CancelButton, PrimaryButton } from './buttons'
import { EyeIcon, PencilIcon } from '@heroicons/react/20/solid'
import dynamic from 'next/dynamic'
import clsx from 'clsx'

interface EditorJsType {
  blocks: {
    type: string
    data: any
  }[]
}

const Editor = dynamic(() => import('./editor-js/Editor'), {
  ssr: false,
})

interface ToggleButtonProps {
  onClick: () => void
  isPreview: boolean
  showText?: boolean
}

function TogglePreview({ onClick, isPreview, showText = true }: ToggleButtonProps) {
  return (
    <div className="mb-2 flex items-center justify-between text-lg">
      <PrimaryButton onClick={onClick} className={' bg-white/20 hover:bg-white/50'}>
        {showText && (isPreview ? 'Show Editor' : 'Show Preview')}
        {isPreview ? <PencilIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </PrimaryButton>
    </div>
  )
}

interface NewPostFormProps {
  editorId: string
  editorReference: RefObject<EditorJsType>
  title: string | false
  setTitle: (value: string) => void
  description: EditorJsType
  setDescription: (value: EditorJsType) => void
  resetForm: (isEdited: boolean) => void
  isReadOnly: boolean
  isEditable: boolean
  handleSubmit: () => void
  itemType?: 'comment' | 'post'
  handlerType?: 'edit' | 'new'
  formVariant?: 'default' | 'icon'
  onOpen?: () => void
  isSubmitting?: boolean
  isSubmitted?: boolean
  submitButtonText?: string
  openFormButtonText?: string
  placeholder?: string
}

export const NewPostForm = ({
  editorId,
  editorReference,
  title,
  setTitle,
  description,
  setDescription,
  resetForm,
  isReadOnly,
  handleSubmit,
  isSubmitting,
  isSubmitted,
  formVariant = 'default',
  itemType = 'post',
  handlerType = 'new',
  onOpen,
  isEditable,
  submitButtonText,
  openFormButtonText,
  placeholder,
}: NewPostFormProps) => {
  const { t } = useTranslation()
  const [isPreview, setIsPreview] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const inputRef = useRef(null)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isFormOpen) {
      inputRef?.current?.focus()
    }
  }, [isFormOpen, inputRef])

  return (
    <div className={clsx(formVariant === 'default' ? 'mt-6 h-auto rounded-lg  bg-white/10 p-6' : '')}>
      {isEditable && !isFormOpen && (
        <div className="flex items-center justify-between">
          <PrimaryButton
            className="text-sm text-gray-500 border border-gray-500 hover:bg-gray-500 hover:text-white transition-colors duration-150"
            onClick={() => {
              setIsFormOpen(true)
              onOpen && onOpen()
            }}
          >
            {openFormButtonText}
          </PrimaryButton>
        </div>
      )}

      {isFormOpen && (
        <div>
          <div className="mb-4 text-xl font-semibold">Editor</div>
          {itemType === 'post' && title !== false && (
            <input
              ref={inputRef}
              className="mb-4 w-full rounded border-gray-200 p-1 text-base transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t(itemType !== 'post' ? 'placeholder.enterComment' : 'placeholder.enterPostTitle') as string}
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            />
          )}
          <div>
            <TogglePreview onClick={() => setIsPreview(!isPreview)} isPreview={isPreview} />
            <div className="rounded border-gray-200  ">
              {isPreview ? (
                description && <EditorJsRenderer data={description} />
              ) : (
                <Editor
                  divProps={{
                    className: 'z-50',
                  }}
                  data={description}
                  editorRef={editorReference}
                  onChange={setDescription}
                  readOnly={isReadOnly}
                  placeholder={placeholder}
                  holder={editorId}
                />
              )}
            </div>

            <div className="mt-4 flex justify-between">
              <CancelButton
                onClick={() => {
                  setIsFormOpen(false)
                  resetForm(handlerType)
                }}
              >
                {t('button.cancel')}
              </CancelButton>
              <PrimaryButton
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={isSubmitting} // Disable while submitting
              >
                {submitButtonText}
              </PrimaryButton>
            </div>

            {isSubmitted && <p>Form submitted successfully!</p>}
            {error && <p>Error submitting form.</p>}
          </div>
        </div>
      )}
    </div>
  )
}

import { useTranslation } from 'react-i18next'
import React, { ChangeEvent, RefObject, useEffect, useRef, useState } from 'react'
import EditorJsRenderer from './editor-js/EditorJSRenderer'
import { CancelButton, PrimaryButton } from './buttons'
import { EyeIcon, PencilIcon } from '@heroicons/react/20/solid'
import dynamic from 'next/dynamic'
import clsx from 'clsx'

export interface EditorJsType {
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
  disabled?: boolean
}

function TogglePreview({ onClick, isPreview, showText = true, disabled }: ToggleButtonProps) {
  return (
    <div className="mb-2 flex items-center justify-between text-sm ">
      {isPreview ? 'Preview' : 'Editor'}
      <PrimaryButton disabled={disabled} onClick={onClick} className={'bg-gray-500/20 hover:bg-gray-500/40'}>
        {showText && (isPreview ? 'Show Editor' : 'Show Preview')}
        {isPreview ? <PencilIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </PrimaryButton>
    </div>
  )
}

export interface NewPostFormProps {
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
  showButtonWhenFormOpen?: boolean
  classes: {
    root?: string
    rootOpen?: string
    rootClosed?: string
    editor?: string
    title?: string
    description?: string
    openFormButton?: string
    openFormButtonOpen?: string
    openFormButtonClosed?: string
    submitButton?: string
    cancelButton?: string
    formContainer?: string
    formContainerOpen?: string
    formContainerClosed?: string
    input?: string
  }
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
  showButtonWhenFormOpen = false,
  classes: c,
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

  const handleSubmitAction = async () => {
    try {
      await handleSubmit()
      setIsFormOpen(false);
    } catch (error) {
      setIsFormOpen(false)
    }
  }

  return (
    <div
      className={clsx(
        'flex flex-col space-y-4 sm:w-full ',
        formVariant === 'default' ? 'mt-6 h-auto rounded-lg  bg-white/10 p-6' : '',
        isFormOpen ? 'border-gray-500 border' : 'items-center',
        c?.root,
        isFormOpen ? c?.rootOpen : c?.rootClosed
      )}
    >
      {isEditable && !(isFormOpen && !showButtonWhenFormOpen) && (
        <PrimaryButton
          className={clsx(
            'w-fit',
            'border-gray-500 border text-sm text-gray-500 transition-colors duration-150 hover:bg-gray-500 hover:text-white',
            c?.openFormButton,
            isFormOpen ? c?.openFormButtonOpen : c?.openFormButtonClosed
          )}
          onClick={() => {
            setIsFormOpen(true)
            onOpen && onOpen()
          }}
        >
          {openFormButtonText}
        </PrimaryButton>
      )}

      {isFormOpen && (
        <div
          className={clsx(
            'min-w-[400px] p-2',
            c?.formContainer,
            isFormOpen ? c?.formContainerOpen : c?.formContainerClosed
          )}
        >
          {itemType === 'post' && title !== false && (
            <input
              ref={inputRef}
              className={clsx(
                'mb-4 w-full rounded border-gray-200 p-1 text-base transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                c?.input
              )}
              placeholder={t(itemType !== 'post' ? 'placeholder.enterComment' : 'placeholder.enterPostTitle') as string}
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            />
          )}
          <div>
            <TogglePreview onClick={() => setIsPreview(!isPreview)} isPreview={isPreview} disabled={!description} />
            <div className="rounded border-gray-200">
              <>
                <div className={isPreview ? '' : 'hidden'}>
                  <EditorJsRenderer data={description} />
                </div>
                <Editor
                  divProps={{
                    className: clsx('z-50', c?.editor, isPreview ? 'hidden' : ''),
                  }}
                  data={description}
                  editorRef={editorReference}
                  onChange={setDescription}
                  readOnly={isReadOnly}
                  placeholder={placeholder}
                  holder={editorId}
                />
              </>
            </div>

            <div className="mt-4 flex justify-between">
              <CancelButton
                className={clsx(c?.cancelButton)}
                onClick={() => {
                  if (description?.blocks?.length > 0) {
                    resetForm(handlerType)
                  } else {
                    setIsFormOpen(false)
                  }
                }}
              >
                {description?.blocks?.length > 0 ? t('button.clearForm') : t('button.closeForm')}
              </CancelButton>
              <PrimaryButton
                className={clsx('bg-gray-500/20 hover:bg-gray-500/40', c?.submitButton)}
                onClick={handleSubmitAction}
                isLoading={isSubmitting}
                disabled={isSubmitting}
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

import { useTranslation } from 'react-i18next'
import React, { ChangeEvent, RefObject, useState } from 'react'
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

function ToggleButton({ onClick, isPreview, showText = true }: ToggleButtonProps) {
  return (
    <PrimaryButton onClick={onClick} className={' bg-white/20 hover:bg-white/50'}>
      {showText && (isPreview ? 'Show Editor' : 'Show Preview')}
      {isPreview ? <PencilIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
    </PrimaryButton>
  )
}

interface NewPostFormProps {
  editorId: string
  editorReference: RefObject<EditorJsType>
  title: string
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
}

function getButtonLabel(
  handlerType: NewPostFormProps['handlerType'],
  itemType: NewPostFormProps['itemType'],
  t: (key: string) => string
) {
  return handlerType === 'edit'
    ? t(itemType === 'comment' ? 'button.editComment' : 'button.saveChanges')
    : t(itemType === 'comment' ? 'button.newComment' : 'button.newPost')
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
  formVariant = 'default',
  itemType = 'post',
  handlerType = 'new',
  onOpen,
  isEditable,
}: NewPostFormProps) => {
  const { t } = useTranslation()
  const [isPreview, setIsPreview] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)

  const buttonLabel = getButtonLabel(handlerType, itemType, t)

  const showTextIfAllowed = text => {
    if (formVariant === 'icon') return ''
    return text
  }

  return (
    <div className={clsx(formVariant === 'default' ? 'mt-6 h-auto rounded-lg  bg-white/10 p-6' : '')}>
      {isEditable && !isFormOpen && (
        <div className="flex items-center justify-between">
          <PrimaryButton
            className="rounded bg-green-500 p-3 text-white transition-colors duration-150 hover:bg-green-600"
            onClick={() => {
              setIsFormOpen(true)
              onOpen && onOpen()
            }}
          >
            {buttonLabel}
          </PrimaryButton>
        </div>
      )}

      {isFormOpen && (
        <div>
          <div className="mb-4 text-xl font-semibold">Editor</div>
          {itemType === 'post' && (
            <input
              className="mb-4 w-full rounded border-gray-200 p-1 text-base transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t(itemType === 'comment' ? 'placeholder.enterComment' : 'placeholder.enterPostTitle')}
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            />
          )}
          <div>
            <div className="mb-2 flex items-center justify-between text-lg">
              <ToggleButton onClick={() => setIsPreview(!isPreview)} isPreview={isPreview} />
            </div>
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
                  placeholder={
                    handlerType === 'edit'
                      ? t(itemType === 'comment' ? 'placeholder.editComment' : 'placeholder.editPost')
                      : t(itemType === 'comment' ? 'placeholder.newComment' : 'new post form')
                  }
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
                className="rounded bg-green-500 p-3 text-white transition-colors duration-150 hover:bg-green-600"
              >
                {buttonLabel}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

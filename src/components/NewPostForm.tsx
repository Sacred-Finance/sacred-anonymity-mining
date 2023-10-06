import { useTranslation } from 'react-i18next'
import React, { Dispatch, RefObject, SetStateAction, useCallback, useRef, useState } from 'react'
import EditorJsRenderer from './editor-js/EditorJSRenderer'
import { CancelButton, PrimaryButton } from './buttons'
import { EyeIcon, PencilIcon } from '@heroicons/react/20/solid'
import dynamic from 'next/dynamic'
import clsx from 'clsx'
import { Tab } from '@headlessui/react'
import { classes } from '@styles/classes'
import { OutputData } from '@editorjs/editorjs'

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
  setIsPreview: (isPreview: boolean) => void
  isPreview: boolean
  showText?: boolean
  disabled?: boolean
}

function EditorTabs({ setIsPreview }: ToggleButtonProps) {
  return (
    <div>
      <Tab.List className="flex items-center gap-4 text-sm">
        <Tab onClick={() => setIsPreview(false)} className={clsx('flex items-center gap-1 border p-2')}>
          {({ selected }) => (
            <div className={clsx('contents', selected && 'text-primary-600')}>
              <PencilIcon className="h-4 w-4" />
              Edit
            </div>
          )}
        </Tab>
        <Tab onClick={() => setIsPreview(true)} className={clsx('flex items-center gap-1 border  p-2')}>
          {({ selected }) => (
            <div className={clsx('contents', selected && 'text-primary-600')}>
              <EyeIcon className="h-4 w-4" />
              Preview
            </div>
          )}
        </Tab>
      </Tab.List>
    </div>
  )
}

export interface NewPostFormProps {
  editorId: string
  title: string | false
  setTitle: Dispatch<SetStateAction<string | null>>
  description: OutputData | null
  setDescription: (value: EditorJsType) => void
  resetForm: (isEdited: boolean) => void
  isReadOnly: boolean
  isEditable: boolean
  handleSubmit: () => void
  itemType?: 'comment' | 'post'
  actionType?: 'edit' | 'new'
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
    formContainerOpen?: string
    formBody?: string
    formContainerClosed?: string
    input?: string
  }
}

const getClassNames = (base, customClassNames, condition) => {
  return clsx(base, condition ? customClassNames?.true : customClassNames?.false)
}

const commonButtonClasses = 'border-gray-500 border text-sm text-gray-500 transition-colors duration-150'

function ContentSection({
  data,
  inputs,
  onChange,
  readOnly,
  placeholder,
  holder,
}: {
  preview: boolean
  data: OutputData | null
  inputs: string | undefined
  onChange: (value: EditorJsType) => void
  readOnly: boolean
  placeholder: string | undefined
  holder: string
}) {
  return (
    <>
      <Tab.Panel className="rounded border-gray-200">
        <Editor
          divProps={{
            className: clsx(
              'z-50 w-full bg-white !text-black form-input h-full rounded-md shadow-md overflow-y-scroll max-h-[calc(50vh)]'
            ),
          }}
          data={data}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          holder={holder}
        />
      </Tab.Panel>
      <Tab.Panel className="rounded border-gray-200">
        <div className={clsx('text-sm text-gray-400', inputs)}>Nothing to preview yet</div>
        <EditorJsRenderer data={data} />
      </Tab.Panel>
    </>
  )
}

export const NewPostForm = ({
  editorId,
  title,
  setTitle,
  description,
  setDescription,
  resetForm,
  isReadOnly,
  handleSubmit,
  isSubmitting,
  isSubmitted,
  itemType = 'post',
  actionType = 'new',
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

  const handleSubmitAction = useCallback(async () => {
    try {
      if (!description?.blocks?.length) {
        setError('Please enter content')
        return
      }
      await handleSubmit()
      setIsFormOpen(false)
    } catch (error) {
      setError(error.message)
      setIsFormOpen(false)
    }
  }, [description, handleSubmit])

  const handleOpen = (): void => {
    if (isFormOpen) {
      setIsFormOpen(false)
      return resetForm(!!actionType)
    }
    setIsFormOpen(true)
    onOpen && onOpen()
  }

  const handleClose = () => {
    resetForm(false)
    setIsFormOpen(false)
  }

  const descriptionLength = React.useMemo(() => {
    return description?.blocks?.reduce((acc, block) => {
      try {
        return acc + block.data.text.length
      } catch (error) {
        return acc
      }
    }, 0)
  }, [description])

  const disableSubmit = React.useMemo(() => {
    return descriptionLength > 100000 || descriptionLength < 1
  }, [descriptionLength])

  return (
    <div
      className={getClassNames(
        'flex flex-col space-y-4 sm:w-full',
        {
          true: [c?.rootOpen, 'border-gray-500 border'],
          false: [c?.rootClosed, 'items-center'],
        },
        isFormOpen
      )}
    >
      {isEditable && !(isFormOpen && !showButtonWhenFormOpen) && (
        <PrimaryButton
          className={getClassNames(
            commonButtonClasses,
            {
              true: [c?.openFormButtonOpen],
              false: [c?.openFormButtonClosed],
            },
            isFormOpen
          )}
          onClick={handleOpen}
        >
          {isFormOpen ? 'Close' : openFormButtonText}
        </PrimaryButton>
      )}

      {isFormOpen && (
        <div
          className={getClassNames(
            'min-w-[400px] p-2',
            {
              true: c?.formContainerOpen,
              false: c?.formContainerClosed,
            },
            isFormOpen
          )}
        >
          <div className={clsx(c?.formBody)}>
            {itemType === 'post' && title !== false && (
              <>
                <label htmlFor={'title'} className="text-md">
                  Title (Max 60)
                </label>

                <input
                  id={'title'}
                  disabled={isPreview}
                  className={clsx(
                    'w-full rounded border-gray-200 p-1 text-base transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100'
                  )}
                  ref={inputRef}
                  placeholder={
                    t(itemType !== 'post' ? 'placeholder.enterComment' : 'placeholder.enterPostTitle') as string
                  }
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </>
            )}
            <Tab.Group>
              <Tab.Panels>
                <div className="text-md">Content</div>
                <ContentSection
                  preview={isPreview}
                  data={description}
                  inputs={c?.editor}
                  onChange={(value: EditorJsType) => {
                    setDescription(value)
                    setError(null)
                  }}
                  readOnly={isReadOnly}
                  placeholder={placeholder}
                  holder={editorId}
                />
              </Tab.Panels>
            </Tab.Group>

            {error && <p className={clsx('text-red-500')}>{error}</p>}
            <FormButtons
              disableSubmit={disableSubmit}
              handleClose={handleClose}
              handleSubmitAction={handleSubmitAction}
              isSubmitting={isSubmitting}
              submitButtonText={submitButtonText}
              t={t}
              c={c}
            />

            {isSubmitted && <p>Form submitted successfully!</p>}
          </div>
        </div>
      )}
    </div>
  )
}

const FormButtons = ({ handleClose, handleSubmitAction, isSubmitting, submitButtonText, t, c, disableSubmit }) => (
  <div className="flex justify-between">
    <CancelButton
      className={clsx(c?.cancelButton, 'bg-red-400 text-white hover:bg-opacity-80 hover:text-white')}
      onClick={handleClose}
    >
      {t('button.closeForm')}
    </CancelButton>
    <PrimaryButton
      className={clsx(c?.submitButton, 'hover:bg-opacity-80')}
      onClick={handleSubmitAction}
      isLoading={isSubmitting}
      disabled={isSubmitting || disableSubmit}
    >
      {submitButtonText}
    </PrimaryButton>
  </div>
)

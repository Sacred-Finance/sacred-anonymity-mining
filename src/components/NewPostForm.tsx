import { useTranslation } from 'react-i18next'
import React, { cloneElement, Dispatch, SetStateAction, useCallback, useRef, useState } from 'react'
import EditorJsRenderer from './editor-js/EditorJSRenderer'
import { CancelButton, PrimaryButton } from './buttons'
import { EyeIcon, PencilIcon } from '@heroicons/react/20/solid'
import dynamic from 'next/dynamic'
import clsx from 'clsx'
import Dropdown from './buttons/Dropdown/Dropdown'
import { Tab } from '@headlessui/react'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import { Input } from '@/shad/ui/input'
import { Label } from '@/shad/ui/label'
import AnonymizeButton from '@components/buttons/AIAnonymiseButton'

export interface EditorJsType {
  blocks: {
    type: string
    data: any
  }[]
}

const percentageToReveal = [0, 25, 50, 75, 100]

const Editor = dynamic(() => import('./editor-js/Editor'), {
  ssr: false,
})



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
  tokenBalanceReveal?: {
    onSelected: (value: number) => void
    selectedValue: number
  }
}

const getClassNames = (base, customClassNames, condition) => {
  return clsx(base, condition ? customClassNames?.true : customClassNames?.false)
}

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
      <Tab.Panel className="rounded border-gray-200  ">
        <Editor
          divProps={{
            className: clsx('z-50 w-full bg-white !text-black form-input h-full rounded-md shadow-md min-h-[35vh]'),
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
  tokenBalanceReveal = null,
}: NewPostFormProps) => {
  const { t } = useTranslation()
  const [isPreview, setIsPreview] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const inputRef = useRef(null)
  const contentRef = useRef(null)
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
          true: [c?.rootOpen, 'border border-gray-500'],
          false: [c?.rootClosed, 'items-center'],
        },
        isFormOpen
      )}
    >
      {isEditable && !(isFormOpen && !showButtonWhenFormOpen) && (
        <PrimaryButton disabled={isReadOnly} onClick={handleOpen}>
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
              <div className={'flex flex-col gap-2'}>
                <Label htmlFor={'title'} className="text-md">
                  Title (Max 60)
                </Label>

                <Input
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
              </div>
            )}
            <Tab.Group>
              <Tab.Panels className={'max-h-[calc(50vh)] overflow-y-scroll'}>
                <div className={'flex justify-between'}>
                  <Label className="text-md">Content</Label>
                  <div className={''}>
                    <AnonymizeButton
                      setDescription={description => {
                        setDescription(description)
                        setError(null)
                        setIsFormOpen(false)

                        // todo this is a hack to make the form open again after the anonymize button is clicked - need to fix this
                        setTimeout(() => {
                          setIsFormOpen(true)
                        }, 100)
                      }}
                      postData={description}
                    />
                  </div>
                </div>

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
              refToUpdateOnChange={inputRef}
              tokenBalanceReveal={tokenBalanceReveal}
            />

            {isSubmitted && <p>Form submitted successfully!</p>}
          </div>
        </div>
      )}
    </div>
  )
}

const FormButtons = ({
  handleClose,
  handleSubmitAction,
  isSubmitting,
  submitButtonText,
  t,
  c,
  disableSubmit,
  tokenBalanceReveal,
}) => (
  <div className="flex justify-between">
    <PrimaryButton
      onClick={handleClose}
      variant={'destructive'}
    >
      {t('button.closeForm')}
    </PrimaryButton>
    <div className="flex flex-row items-center gap-2">
      {tokenBalanceReveal && (
        <Dropdown
          options={percentageToReveal.map(percentage => ({ key: `${percentage}%`, value: percentage }))}
          selected={{ key: `${tokenBalanceReveal.selectedValue}% Reveal`, value: tokenBalanceReveal?.selectedValue }}
          onSelect={value => tokenBalanceReveal?.onSelected(value)}
          disabled={false}
        />
      )}
      <PrimaryButton
        onClick={handleSubmitAction}
        isLoading={isSubmitting}
        disabled={isSubmitting || disableSubmit}
      >
        {submitButtonText}
      </PrimaryButton>
    </div>
  </div>
)

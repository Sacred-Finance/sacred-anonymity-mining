import { useTranslation } from 'react-i18next'
import type { Dispatch, SetStateAction } from 'react'
import React, { useCallback, useRef, useState } from 'react'
import { PrimaryButton } from './buttons'
import dynamic from 'next/dynamic'
import clsx from 'clsx'
import Dropdown from './buttons/Dropdown/Dropdown'
import { Tab } from '@headlessui/react'
import type { OutputData } from '@editorjs/editorjs'
import { Input } from '@/shad/ui/input'
import { Label } from '@/shad/ui/label'
import AnonymizeButton from '@components/buttons/AIAnonymiseButton'
import { Card, CardContent, CardFooter, CardHeader } from '@/shad/ui/card'
import { cn } from '@/shad/lib/utils'
import { ScrollArea } from '@/shad/ui/scroll-area'

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
  return clsx(
    base,
    condition ? customClassNames?.true : customClassNames?.false
  )
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
    <ScrollArea className="h-[500px] w-full rounded-xl border bg-gray-950/10   p-4 ">
      <Editor
        divProps={{
          className: cn(
            'z-50 w-full form-input h-full rounded-md bg-gradient-to-r  min-h-[15vh]'
          ),
        }}
        data={data}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder || 'Start writing here...'}
        holder={holder}
      />
    </ScrollArea>
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
    <Card
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
            'flex min-w-[400px] flex-col gap-2 p-2',
            {
              true: c?.formContainerOpen,
              false: c?.formContainerClosed,
            },
            isFormOpen
          )}
        >
          {itemType === 'post' && title !== false && (
            <CardContent className={'flex flex-col gap-2'}>
              <Label htmlFor={'title'} className="text-md">
                Title (Max 60)
              </Label>

              <Input
                id={'title'}
                disabled={isPreview}
                className=" w-full rounded-xl border bg-gray-950/10   p-4 "
                ref={inputRef}
                placeholder={
                  t(
                    itemType !== 'post'
                      ? 'placeholder.enterComment'
                      : 'placeholder.enterPostTitle'
                  ) as string
                }
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </CardContent>
          )}
          <Tab.Group>
            <Tab.Panels>
              <CardHeader className={'flex justify-between'}>
                <Label className="text-md">Content</Label>
              </CardHeader>
              <CardContent>
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
              </CardContent>
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
          >
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
          </FormButtons>

          {isSubmitted && <p>Form submitted successfully!</p>}
        </div>
      )}
    </Card>
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
  children,
}) => (
  <CardFooter className="flex justify-between">
    <PrimaryButton onClick={handleClose} variant={'destructive'}>
      {t('button.closeForm')}
    </PrimaryButton>
    <div className="flex flex-row items-center gap-2">
      {tokenBalanceReveal && (
        <Dropdown
          options={percentageToReveal.map(percentage => ({
            key: `${percentage}%`,
            value: percentage,
          }))}
          selected={{
            key: `${tokenBalanceReveal.selectedValue}% Reveal`,
            value: tokenBalanceReveal?.selectedValue,
          }}
          onSelect={value => tokenBalanceReveal?.onSelected(value)}
          disabled={false}
        />
      )}
      {children}

      <PrimaryButton
        onClick={handleSubmitAction}
        isLoading={isSubmitting}
        disabled={isSubmitting || disableSubmit}
      >
        {submitButtonText}
      </PrimaryButton>
    </div>
  </CardFooter>
)

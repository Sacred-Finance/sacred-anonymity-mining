import React, { memo, useEffect, useRef, useState } from 'react'
import type { OutputData } from '@editorjs/editorjs'
import EditorJS from '@editorjs/editorjs'
import clsx from 'clsx'
import { CircularLoader } from '@components/buttons/JoinCommunityButton' // Consider renaming or reorganizing this if `CircularLoader` doesn't belong to a button component.
import { EDITOR_TOOLS } from './editor-tool'

type DivProps = {
  className?: string
  [key: string]: any
}

type Props = {
  data?: typeof OutputData
  onChange(val: typeof OutputData): void
  holder: string
  placeholder?: string
  readOnly?: boolean
  divProps?: DivProps
}

const EditorBlock = ({
  data,
  onChange,
  holder,
  divProps = {},
  placeholder = 'Start writing your post...',
  readOnly = false,
}: Props) => {
  const [isReady, setIsReady] = useState(false)
  const ref = useRef<typeof EditorJS | null>(null)

  useEffect(() => {
    if (!ref.current && !holder) {
      return
    }

    const editor = new EditorJS({
      holder,
      inlineToolbar: true,
      hideToolbar: false,
      tools: EDITOR_TOOLS,
      readOnly,
      autofocus: false,
      placeholder,
      data,
      async onChange(api) {
        if (!readOnly) {
          const savedData = await api?.saver?.save?.()
          onChange(savedData)
        }
      },
      onReady() {
        if (readOnly) {
          const el = document.getElementById(holder)
          const inputs = el?.getElementsByTagName('input') || []
          const textareas = el?.getElementsByTagName('textarea') || []

          ;[...inputs, ...textareas].forEach(input => input.setAttribute('readonly', 'readonly'))
        }

        setIsReady(true)
      },
    })
    ref.current = editor
    // Cleanup function for the effect.
    return () => {
      ref?.current?.destroy()
    }
    // just holder
  }, [holder])

  return (
    <>
      <div
        {...divProps}
        className={clsx(
          isReady ? 'prose-lg h-full w-full !bg-background/90 text-foreground' : 'hidden',
          divProps.className
        )}
        id={holder}
      />
      {(!isReady || !ref?.current) && <CircularLoader className="h-12" />}
    </>
  )
}

export default memo(EditorBlock)

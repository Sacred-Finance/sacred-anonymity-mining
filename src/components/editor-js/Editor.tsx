import React, { memo, useEffect, useRef } from 'react'
import type { OutputData } from '@editorjs/editorjs'
import EditorJS from '@editorjs/editorjs'
import clsx from 'clsx'
import { CircularLoader } from '@components/buttons/JoinCommunityButton'
import { EDITOR_TOOLS } from './editor-tool'
import { Input } from '@/shad/ui/input'

type DivProps = { className?: string; [key: string]: any }

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
  ...props
}: Props) => {
  const editorInstance = useRef<typeof EditorJS | null>(null)

  useEffect(() => {
    const editor = new EditorJS({
      holder,
      inlineToolbar: true,
      hideToolbar: false,
      tools: EDITOR_TOOLS,
      readOnly,
      placeholder,
      data,
      async onContentChange(api) {
        if (!readOnly) {
          const savedData = await api.saver.save()
          onChange(savedData)
        }
      },
      onReady() {
        editorInstance.current = editor
      },
    })

    return () => {
      editorInstance.current?.destroy()
    }
  }, [holder, onChange, readOnly])

  useEffect(() => {
    const handleDataUpdate = async () => {
      if (data && editorInstance.current) {
        await editorInstance.current.isReady
        editorInstance.current.clear()
        editorInstance.current.render(data)
      }
    }
    handleDataUpdate()
  }, [data])

  return (
    <>
      <div
        id={holder}
        {...divProps}
        className={clsx('prose-lg h-full w-full !bg-background/90 text-foreground', divProps.className)}
      />
      <Input type={'hidden'} {...props} />
      {!editorInstance.current && <CircularLoader className="h-12" />}
    </>
  )
}

export default memo(EditorBlock)

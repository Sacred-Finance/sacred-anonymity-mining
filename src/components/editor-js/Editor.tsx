//./components/Editor
import React, { memo, useEffect, useImperativeHandle, useRef } from 'react'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import { EDITOR_TOOLS } from './editor-tool'
import clsx from 'clsx'
import { CircularLoader } from '@components/JoinCommunityButton'

//props
type Props = {
  data?: OutputData
  onChange(val: OutputData): void
  holder: string
  placeholder?: string
  className?: string
  editorRef?: React.MutableRefObject<EditorJS>
  readOnly?: boolean
  divProps?: any
}

const EditorBlock = ({ data, onChange, holder, className, divProps = {}, editorRef, placeholder, readOnly }: Props) => {
  const [isReady, setIsReady] = React.useState(false)
  //add a reference to editor
  const ref = useRef<EditorJS>()
  useImperativeHandle(editorRef, () => ({
    clear() {
      ref?.current?.clear?.()
    },
    destroy() {
      ref?.current?.destroy?.()
    },
    render(data: OutputData): Promise<void> {
      if (!ref.current || !data) return Promise.resolve()

      return ref?.current?.render?.(data)
    },
    //@ts-ignore
    async isReady() {
      if (!ref.current || !data) return Promise.resolve()
      return (await ref?.current?.isReady) as unknown as Promise<void>
    },
  }))

  useEffect(() => {
    if (!ref.current) return
    ref?.current?.readOnly?.toggle?.()

    if (!readOnly) {
      console.log('re-rendering for non-readonly')

      setTimeout(() => {
        if (ref?.current?.focus) ref.current.focus(true)
      }, 200)
    } else {
      console.log('re-rendering for readonly')
      setTimeout(() => {
        if (ref?.current?.render && data?.blocks) ref.current.render(data)
      }, 0)
    }
    if (!data?.blocks) {
      setTimeout(() => {
        if (ref?.current?.clear) ref.current.clear()
      }, 200)
    }
  }, [readOnly])
  //initialize editorjs
  useEffect(() => {
    //initialize editor if we don't have a reference
    if (!ref.current) {
      if (!holder) return
      const editor = new EditorJS({
        holder: holder,
        tools: EDITOR_TOOLS,
        readOnly,
        placeholder: placeholder || 'Start writing your post...',
        data,
        async onChange(api, event) {
          if (readOnly) return
          const data = await api.saver.save()
          onChange(data)
        },
        onReady() {
          // todo: make it work only for editor
          // const links = document.getElementsByTagName('a')
          // for (let i = 0; i < links.length; i++) {
          //   const link = links[i]
          //   link.setAttribute('target', '_blank')
          //   link.setAttribute('rel', 'noopener')
          //   link.setAttribute('aria-label', 'External link (opens in new tab)')
          // }
          // If readonly set the editor to readonly
          if (readOnly) {
            const el = document.getElementById(holder)
            if (el) {
              // get any input or textarea elements and set them to readonly
              const inputs = el.getElementsByTagName('input')
              const textareas = el.getElementsByTagName('textarea')
              for (let i = 0; i < inputs.length; i++) {
                inputs[i].setAttribute('readonly', 'readonly')
              }
              for (let i = 0; i < textareas.length; i++) {
                textareas[i].setAttribute('readonly', 'readonly')
              }
            }
          }
          setIsReady(true)
        },
      })
      ref.current = editor
    }

    //add a return function handle cleanup
    return () => {
      if (ref.current && ref.current.destroy) {
        ref.current.destroy()
      }
    }
  }, [])

  return (
    <>
      <div
        {...divProps}
        className={clsx(isReady ? 'h-full w-full text-black dark:text-white' : 'hidden', divProps.className)}
        id={holder}
      ></div>
      {!isReady && <CircularLoader className={'h-12'} />}
    </>
  )
}

export default memo(EditorBlock)

//./components/Editor
import React, { memo, useEffect, useImperativeHandle, useRef } from 'react'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import { EDITOR_TOOLS } from './editor-tool'
import { reference } from '@popperjs/core'

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
  //add a reference to editor
  const ref = useRef<EditorJS>()
  useImperativeHandle(editorRef, () => ({
    clear() {
      ref?.current?.clear()
    },
    reRender() {
      if (ref?.current?.render) {
        ref?.current?.render(data)
      }
    },
  }))
  //initialize editorjs
  useEffect(() => {
    //initialize editor if we don't have a reference
    if (!ref.current) {
      const editor = new EditorJS({
        holder: holder,
        tools: EDITOR_TOOLS,
        placeholder: placeholder || 'Start writing your post...',
        data,
        async onChange(api, event) {
          const data = await api.saver.save()
          onChange(data)
        },
        onReady() {
          const links = document.getElementsByTagName('a');
          for (let i = 0; i < links.length; i++) {
            const link = links[i]
            link.setAttribute('target', '_blank')
            link.setAttribute('rel', 'noopener')
            link.setAttribute('aria-label', 'External link (opens in new tab)')
          }
          // If readonly remove extra margin applied to below mentioned class
          if (readOnly) {
            const el = document.getElementById(holder)
            const codeEditorRedactor: any = el.getElementsByClassName('codex-editor__redactor')
            codeEditorRedactor[0].style.marginRight = '0'
          }
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

  return <>{readOnly}<div className={'w-full dark:text-white text-black '} id={holder} {...divProps} /></>
}

export default memo(EditorBlock)

//./components/Editor
import React, { memo, useEffect, useRef } from 'react'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import { EDITOR_TOOLS } from './editor-tool'

//props
type Props = {
  data?: OutputData
  onChange(val: OutputData): void
  holder: string
  placeholder?: string
  className?: string
  postEditorRef?: React.MutableRefObject<EditorJS>
}

const EditorBlock = ({ data, onChange, holder, className, postEditorRef }: Props) => {
  //add a reference to editor
  const ref = useRef<EditorJS>()

  //initialize editorjs
  useEffect(() => {
    if (!postEditorRef) return
    // make postEditorRef.current point to the editor instance
    postEditorRef.current = ref.current
    //initialize editor if we don't have a reference
    if (!ref.current) {
      const editor = new EditorJS({
        holder: holder,
        tools: EDITOR_TOOLS,
        placeholder: 'Start writing your post...',
        data,
        async onChange(api, event) {
          const data = await api.saver.save()
          onChange(data)
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
  }, [ref, postEditorRef, onChange])

  return <div id={holder} />
}

export default memo(EditorBlock)

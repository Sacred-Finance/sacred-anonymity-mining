import React, { memo } from 'react'
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";
import { uploadImageToIPFS } from '@/lib/utils'
import { useTheme } from 'next-themes'

type DivProps = {
  className?: string
  [key: string]: any
}

type Props = {
  data?: PartialBlock[]
  onChange?: (val: PartialBlock[]) => void
  placeholder?: string
  readOnly?: boolean
  divProps?: DivProps
}

const EditorBlock = ({
  data,
  onChange,
  readOnly = false,
}: Props) => {
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const editor: BlockNoteEditor = useBlockNote({
    initialContent: data,
    uploadFile: uploadImageToIPFS,
    onEditorContentChange(editor) {
      onChange && onChange(editor.topLevelBlocks)
    },
    domAttributes: {
      editor: {
        class: 'editor'
      }
    },
    editable: !readOnly
  });

  return (
    <>
      <BlockNoteView editor={editor} theme={currentTheme} />
    </>
  )
}

export default memo(EditorBlock)

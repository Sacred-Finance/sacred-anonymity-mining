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

  /** Custom Paste Event for pasting image */
  const onPaste = async (event) => {
    event.preventDefault()
    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
      const imageType = clipboardItem.types.find(type => type.startsWith('image/')) ?? []
      if (imageType) {
        const blob = await clipboardItem.getType(imageType);
        const blockLength = editor.topLevelBlocks.length
        editor.uploadFile && editor?.uploadFile(blob).then((url) => {
          editor.insertBlocks([{
            type: 'image',
            props: {
              url,
              caption: '',
            }
          }], editor.topLevelBlocks[blockLength - 1], 'after')
        })
      }
    }

  }

  return (
    <>
      <BlockNoteView onPaste={onPaste} editor={editor} theme={currentTheme} />
    </>
  )
}

export default memo(EditorBlock)

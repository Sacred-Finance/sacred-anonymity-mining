import type { OutputData } from '@editorjs/editorjs'
import React, { memo } from 'react'
import clsx from 'clsx'

const editorJsHtml = require('editorjs-html')
const EditorJsToHtml = editorJsHtml()

interface Props {
  data?: typeof OutputData | string
  isHtml?: boolean
  className?: string
}

const EditorJsRenderer = ({ data, isHtml = false, className }: Props) => {
  if (!data) {
    return null
  }

  let html: (string | JSX.Element)[] = []

  if (isHtml && typeof data === 'string') {
    html = [data]
  } else if (data && Array.isArray(data.blocks) && 'blocks' in data && data.blocks.length) {
    html = EditorJsToHtml?.parse(data) as (string | JSX.Element)[]
  }

  if (!Array.isArray(html)) {
    console.log('html is not an array', html)
    return null
  }

  return (
    <div className={clsx('prose-lg overflow-y-hidden', className)}>
      {html.map((item, index) => {
        if (typeof item === 'string') {
          return <div dangerouslySetInnerHTML={{ __html: item }} key={index}></div>
        }
        // Assuming the object can be represented by its keys. Adjust if needed.
        return <div key={index}>{Object.keys(item).join(', ')}</div>
      })}
    </div>
  )
}

export default memo(EditorJsRenderer)

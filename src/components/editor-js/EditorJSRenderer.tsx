import { OutputData } from '@editorjs/editorjs'
import React from 'react'
import clsx from 'clsx'

const editorJsHtml = require('editorjs-html')
const EditorJsToHtml = editorJsHtml()

interface Props {
  data?: OutputData | string
  isHtml?: boolean
  className?: string
}

const EditorJsRenderer = ({ data, isHtml = false, className }: Props) => {
  if (!data) {
    return null
  }

  console.log(data)

  let html: (string | JSX.Element)[] = []

  if (isHtml && typeof data === 'string') {
    html = [data]
  } else if (data && 'blocks' in data && Array.isArray(data.blocks) && data.blocks.length) {
    html = EditorJsToHtml?.parse(data) as (string | JSX.Element)[]
  }

  if (!Array.isArray(html)) {
    console.log('html is not an array', html)
    return null
  }

  return (
    <div className={clsx('select:text-primary-400 prose-lg max-w-full ', className)}>
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

export default EditorJsRenderer

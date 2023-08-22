import { OutputData } from '@editorjs/editorjs'
import React from 'react'

const editorJsHtml = require('editorjs-html')
const EditorJsToHtml = editorJsHtml()


interface Props {
  data: OutputData | string
  onlyPreview?: boolean
    isHtml?: boolean
}

type ParsedContent = string | JSX.Element

const EditorJsRenderer = ({ data, onlyPreview = false, isHtml = false }: Props) => {
  if (!data) {
    return null
  }
  const html = isHtml ? data : EditorJsToHtml.parse(data) as ParsedContent[]

  if (onlyPreview) {
    // Determine the logic to display only preview. This depends on your preview requirements.
    // For now, let's assume you want to display only the first item as a preview.
    const preview = html.length > 0 ? html[0] : null

    if (typeof preview === 'string') {
      return (
        <>
          <div className={'inline-flex'} dangerouslySetInnerHTML={{ __html: preview }}></div> ...
        </>
      )
    }

    if (typeof preview === 'object') {
      return <div>{Object.keys(preview)} </div>
    }

    // If there's no preview available, we can return a default message or an empty element.
    return <div>No preview available</div>
  }

  return (
    <div className="prose max-w-full" key={data.time}>
      {html.map((item, index) => {
        if (typeof item === 'string') {
          return <div dangerouslySetInnerHTML={{ __html: item }} key={index}></div>
        }
        if (typeof item === 'object') {
          return <div key={index}>{Object.keys(item)}</div>
        }
      })}
    </div>
  )
}

export default EditorJsRenderer

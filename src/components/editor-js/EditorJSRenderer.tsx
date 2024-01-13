import React, { memo } from 'react'
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

  let html: (string | JSX.Element | object)[] = []

  if (isHtml && typeof data === 'string') {
    html = [data]
  } else if (data && Array.isArray(data.blocks) && 'blocks' in data && data.blocks.length) {
    html = EditorJsToHtml?.parse(data) as (string | JSX.Element | object)[]
  }

  // Debugging: Log the output for inspection
  console.log('Rendered HTML:', html)

  if (!Array.isArray(html)) {
    console.log('html is not an array', html)
    return null
  }

  return (
    <div className={clsx('prose-lg overflow-y-hidden', className)}>
      {html.map((item, index) => {
        if (typeof item === 'string') {
          return <div dangerouslySetInnerHTML={{ __html: item }} key={index}></div>
        } else if (React.isValidElement(item)) {
          return <React.Fragment key={index}>{item}</React.Fragment>
        } else if (typeof item === 'object') {
          // Custom rendering for object types
          return (
            <div key={index}>
              {JSON.stringify(
                item,
                (key, value) => {
                  if (key === 'text') {
                    return value
                  }
                  return value
                },
                2
              )}
            </div>
          )
        }
        return <div key={index}>Unsupported content type</div>
      })}
    </div>
  )
}

export default memo(EditorJsRenderer)

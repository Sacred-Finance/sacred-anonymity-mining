import { OutputBlockData, OutputData } from '@editorjs/editorjs'
import editorJsHtml, { EditorJsHtmlOptions } from 'editorjs-html'
import CodeRenderer from '../CodeRenderer'

const options: EditorJsHtmlOptions = {
  code: (block: OutputBlockData<string>) => {
    console.log(block)
    return <CodeRenderer code={block.data.code} />
  },
}

const EditorJsToHtml = editorJsHtml(options)

type Props = {
  data: OutputData
}

type ParsedContent = string | JSX.Element

const EditorJsRenderer = ({ data }: Props) => {
  const html = EditorJsToHtml.parse(data) as ParsedContent[]
  return (
    <div>
      {html.map((item, index) => {
        if (typeof item === 'string') {
          return <div dangerouslySetInnerHTML={{ __html: item }} key={index}></div>
        }
        return item
      })}
    </div>
  )
}

export default EditorJsRenderer

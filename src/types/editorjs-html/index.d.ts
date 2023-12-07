declare module 'editorjs-html' {
  import { OutputData } from '@editorjs/editorjs'

  export interface EditorJsHtmlOptions {
    [blockType: string]: (block: any) => string | JSX.Element
  }

  export interface EditorJsHtml {
    parse(data: OutputData): Array<string | JSX.Element>
  }

  const editorJsHtml: (options?: EditorJsHtmlOptions) => EditorJsHtml
  export default editorJsHtml
}

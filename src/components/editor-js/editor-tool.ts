import Code from '@editorjs/code'
import Header from '@editorjs/header'
import Paragraph from '@editorjs/paragraph'
import Checklist from '@editorjs/checklist'
import Delimiter from '@editorjs/delimiter'
import Embed from '@editorjs/embed'
import Image from '@editorjs/image'
import List from '@editorjs/list'
import Marker from '@editorjs/marker'
import Quote from '@editorjs/quote'
import Table from '@editorjs/table'
import Warning from '@editorjs/warning'
import Underline from '@editorjs/underline'
import { uploadImageToIPFS } from '@/lib/utils' // Ensure this path is correct

// Define a custom interface for the tools
interface ToolConfig {
  class: any // Tool class
  inlineToolbar?: boolean
  shortcut?: string
  config?: any
}

// Define the type for the EDITOR_TOOLS
interface EditorTools {
  [toolName: string]: ToolConfig
}

export const EDITOR_TOOLS: EditorTools = {
  header: {
    class: Header,
    inlineToolbar: true,
    shortcut: 'CMD+SHIFT+H',
  },
  paragraph: {
    class: Paragraph,
    inlineToolbar: true,
    config: {
      tunes: true,
    },
  },
  checklist: {
    class: Checklist,
    inlineToolbar: true,
  },
  delimiter: Delimiter,
  embed: {
    class: Embed,
  },
  code: {
    class: Code,
    inlineToolbar: true,
    shortcut: 'CMD+SHIFT+C',
  },
  list: {
    class: List,
    inlineToolbar: true,
    config: {
      defaultStyle: 'ordered',
    },
    shortcut: 'CMD+SHIFT+L',
  },
  marker: Marker,
  quote: {
    class: Quote,
    inlineToolbar: true,
    shortcut: 'CMD+SHIFT+O',
  },
  // raw: Raw,
  // image: SimpleImage,
  table: {
    class: Table,
    inlineToolbar: true,
    config: {
      rows: 2,
      cols: 3,
    },
  },
  warning: {
    class: Warning,
    inlineToolbar: true,
    shortcut: 'CMD+SHIFT+W',
    config: {
      titlePlaceholder: 'Title',
      messagePlaceholder: 'Message',
    },
  },
  underline: Underline,
  image: {
    class: Image,
    config: {
      /**
       * Custom uploader
       */
      uploader: {
        /**
         * Upload file to the server and return an uploaded image data
         * @param {File} file - file selected from the device or pasted by drag-n-drop
         * @return {Promise.<{success, file: {url}}>}
         */
        uploadByFile(file) {
          // your own uploading logic here
          return uploadImageToIPFS(file).then(hash => {
            return {
              success: 200,
              file: {
                url: `https://ipfs.io/ipfs/${hash}`,
              },
            }
          })
        },
      },
    },
  },
}

import { OutputData } from '@editorjs/editorjs'

export function OutputDataToMarkDown(description: OutputData) {
  return description.blocks.reduce((acc, block, idx) => {
    let content = ''
    if (idx !== 0) {
      acc += '\n'
    }

    switch (block.type) {
      case 'paragraph':
        content = block.data.text
        break
      case 'header':
        content = `# ${block.data.text}`
        break
      case 'list':
        content = block.data.items.reduce((acc, item) => acc + `- ${item}\n`, '')
        break
      case 'code':
        content = `\`\`\`${block.data.language}\n${block.data.code}\n\`\`\``
        break
      case 'delimiter':
        content = `---`
        break
      case 'image':
        content = `![${block.data.caption}](${block.data.file.url})`
        break
      case 'table':
        // Need more complex handling for tables here...
        break
      case 'quote':
        content = `> ${block.data.text}`
        break
      case 'warning':
        content = `> ${block.data.title}\n${block.data.message}`
        break
      case 'linkTool':
        content = `[${block.data.meta.title}](${block.data.link})` // Updated link structure
        break
      case 'embed':
        content = `\`${block.data.html}\`` // Enclosed HTML with backticks
        break
      case 'raw':
        content = `${block.data.html}`
        break
      case 'checklist':
        content = block.data.items.reduce((acc, item) => acc + `- [${item.checked ? 'x' : ' '}] ${item.text}\n`, '')
        break
      default:
        content = ''
    }

    acc += content
    return acc
  }, '')
}

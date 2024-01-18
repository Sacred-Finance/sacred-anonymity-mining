import type { OutputData } from '@editorjs/editorjs'

export function OutputDataToMarkDown(description: typeof OutputData) {
  return description?.blocks?.reduce((acc, block, idx) => {
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

export const OutputDataToHTML = (description: typeof OutputData | undefined) => {
  let convertedHtml = ''
  description?.blocks?.map(block => {
    switch (block.type) {
      case 'header':
        convertedHtml += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`
        break
      case 'embded':
        convertedHtml += `<div><iframe width="560" height="315" src="${block.data.embed}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`
        break
      case 'paragraph':
        convertedHtml += `<p>${block.data.text}</p>`
        break
      case 'delimiter':
        convertedHtml += '<hr />'
        break
      case 'image':
        convertedHtml += `<img class="img-fluid" src="${block.data.file.url}" title="${block.data.caption}" /><br /><em>${block.data.caption}</em>`
        break
      case 'list':
        convertedHtml += '<ul>'
        block.data.items.forEach(function (li) {
          convertedHtml += `<li>${li}</li>`
        })
        convertedHtml += '</ul>'
        break
      default:
        console.log('Unknown block type', block.type)
        break
    }
  })
  return convertedHtml
}

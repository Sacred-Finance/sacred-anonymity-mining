import React, { memo } from 'react'
import clsx from 'clsx'
import type { OutputData } from '@editorjs/editorjs'
import DOMPurify from 'dompurify'

const editorJsHtml = require('editorjs-html')

function checklistParser(block) {
  const items = block.data.items
    .map(item => `<li class="${item.checked ? 'line-through text-primary' : 'text-foreground'}">${item.text}</li>`)
    .join('')
  return `<ul class="list-disc pl-5 space-y-1 text-foreground">${items}</ul>`
}

function listParser(block) {
  // console.log(block)
  // return ''
  const items = block.data?.items?.map(item => `<li class="text-foreground">${item}</li>`).join('') || 'no list items?'
  return `<ul class="list-disc pl-5 space-y-1">${items}</ul>`
}

function codeParser(block) {
  if (!block.data.code) {
    return 'no code?'
  }
  return `<pre class="mb-4 flex flex-col"><code class="p-2 bg-card text-card-foreground overflow-auto rounded">${block.data.code}</code></pre>`
}

function paragraphParser(block) {
  if (!block.data.text) {
    return ''
  }
  return `<p class="mb-4 text-foreground">${block.data.text}</p>`
}

function headerParser(block) {
  if (!block.data.text) {
    return ''
  }
  return `<h${block.data.level} class="mb-4 text-xl text-foreground">${block.data.text}</h${block.data.level}>`
}

function imageParser(block) {
  if (!block.data.file) {
    return `<span class="text-foreground italic">Image not found</span>`
  }
  return `<img src="${block.data.file.url}" alt="${block.data.caption}" class="max-w-full"/>`
}

function delimiterParser() {
  return `<hr class="my-4 border-border"/>`
}

function embedParser(block) {
  return `<div class="aspect-w-16 aspect-h-9 bg-background">${block.data.embed}</div>`
}

function tableParser(block) {
  const rows = block.data.content.map(row => {
    const columns = row.map(column => `<td class="text-foreground px-2 ">${column}</td>`).join('')
    return `<tr class="bg-background">${columns}</tr>`
  })
  return `<table class="table-auto my-2 w-full bg-background text-foreground">${rows.join('')}</table>`
}

function quoteParser(block: { data: { text: string; caption: string } }) {
  return `<blockquote class="mb-4 text-foreground"><p class="mb-2">${block?.data?.text}</p><p class="text-right text-secondary-foreground">${block?.data?.caption}</p></blockquote>`
}

function linkParser(block: { data: { link: string } }) {
  return `<a href="${block.data.link}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${block.data.link}</a>`
}

function warningParser(block: { data: { message: string } }) {
  return `<div class="bg-destructive/10 border-l-4 border-destructive text-destructive p-4" role="alert"><p class="font-bold">Warning</p><p class="text-foreground">${block.data.message}</p></div>`
}

const EditorJsToHtml = editorJsHtml({
  checklist: checklistParser,
  list: listParser,
  code: codeParser,
  paragraph: paragraphParser,
  header: headerParser,
  image: imageParser,
  delimiter: delimiterParser,
  embed: embedParser,
  table: tableParser,
  quote: quoteParser,
  link: linkParser,
  warning: warningParser,
})
interface Props {
  data?: typeof OutputData | string
  className?: string
}

const EditorJsRenderer = ({ data, className }: Props) => {
  if (!data) {
    return null
  }

  let htmlContent = data

  if (typeof data === 'object' && data.blocks) {
    const htmlArray = EditorJsToHtml.parse(data)
    htmlContent = htmlArray.join('')
  }
  const sanitizedHtml = DOMPurify.sanitize(htmlContent)

  return <div className={clsx('prose max-w-none', className)} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
}

export default memo(EditorJsRenderer)

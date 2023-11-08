import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shad/ui/accordion'
import { CheckCircle } from 'lucide-react'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import React from 'react'
import { AiAccordionConfig, analysisLabelsAndTypes } from '@components/Post/AiAccordionConfig'
import { useAIDigest } from '@components/Post/PostPage'

function AiAccordionItem({ config, responses }: { config: AiAccordionConfig; responses: { [key: string]: string } }) {
  return (
    <AccordionItem value={config.key}>
      <AccordionTrigger>
        <span className={'inline-flex gap-4'}>
          <CheckCircle className={responses[config.responseKey] ? 'text-green-500' : 'text-gray-500'} />
          {config.label}
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <EditorJsRenderer data={responses[config.responseKey]} isHtml={true} />
      </AccordionContent>
    </AccordionItem>
  )
}

// Parent component where the AiAccordionItem is used
export function DynamicAccordion() {
  const { responses, setResponses, setEnabled, enabled } = useAIDigest()

  return (
    <Accordion
      type="single"
      collapsible
      className="mb-2 rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
    >
      {analysisLabelsAndTypes.map(config => (
        <AiAccordionItem key={config.key} config={config} responses={responses} />
      ))}
    </Accordion>
  )
}

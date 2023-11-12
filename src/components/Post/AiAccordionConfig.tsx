import { Template } from '@pages/api/gpt-server/logos-ai'

export interface AiAccordionConfig {
  key: Template
  label: string
  responseKey: string
  description?: string
  enabled?: boolean
}

export const analysisLabelsAndTypes: AiAccordionConfig[] = [
  {
    key: Template.Summarize_ToSimpleMarkdown,
    label: 'Summarize',
    responseKey: 'setSummarizeResponse',
    description: 'Summarize the post in 1-2 sentences',
    enabled: true,
  },
  {
    key: Template.SWOT_ToSimpleMarkdown,
    label: 'SWOT',
    responseKey: 'setSwotResponse',
    description: 'Strengths, Weaknesses, Opportunities, Threats',
    enabled: true,
  },
  {
    key: Template.CausalChain_ToSimpleMarkdown,
    label: 'Causal Chain',
    responseKey: 'setCausalChainResponse',
    description: 'What are the causes and effects of this post?',
    enabled: true,
  },
  {
    key: Template.SecondOrder_ToSimpleMarkdown,
    label: 'Second Order',
    responseKey: 'setSecondOrderResponse',
    description: 'Consider the second order effects of this post',
    enabled: true,
  },
  {
    key: Template.UnbiasedCritique_ToSimpleMarkdown,
    label: 'Unbiased Critique',
    responseKey: 'setUnbiasedCritiqueResponse',
    description: 'Provide an unbiased critique of this post',
    enabled: true,
  },
  {
    key: Template.ProsAndCons_ToSimpleMarkdown,
    label: 'Pros and Cons',
    responseKey: 'setProsAndConsResponse',
    description: 'Highlight the pros and cons of this post',
    enabled: true,
  },
]

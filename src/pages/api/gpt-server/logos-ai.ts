import type { NextApiRequest, NextApiResponse } from 'next'
import { gptPostHandler } from '@pages/api/discourse/helper'

export enum Template {
  Chat = 'Chat',
  SpamDetection = 'SpamDetection',
  ExpertPoints = 'ExpertPoints',
  Categorize = 'Categorize',
  Summarize = 'Summarize',
  Anonymize = 'Anonymize',
  CompleteSentence = 'CompleteSentence',
  CompleteParagraph = 'CompleteParagraph',
  GetContext = 'GetContext', //intermediate step that other templates use
  ProsAndCons = 'ProsAndCons',
  UnbiasedCritique = 'UnbiasedCritique',
  SecondOrder = 'SecondOrder',
  CausalChain = 'CausalChain',
  SWOT = 'SWOT',
  Sentiment = 'Sentiment',
  Highlight = 'Highlight', //final step
  CleanMarkdown = 'CleanMarkdown', //final step
  Truncate = 'Truncate', //final step
  Summarize_ToSimpleMarkdown = 'Summarize_ToSimpleMarkdown', //final step
  ProsAndCons_ToSimpleMarkdown = 'ProsAndCons_ToSimpleMarkdown', //final step
  SWOT_ToSimpleMarkdown = 'SWOT_ToSimpleMarkdown', //final step
  CausalChain_ToSimpleMarkdown = 'CausalChain_ToSimpleMarkdown', //final step
  SecondOrder_ToSimpleMarkdown = 'SecondOrder_ToSimpleMarkdown', //final step
  UnbiasedCritique_ToSimpleMarkdown = 'UnbiasedCritique_ToSimpleMarkdown', //final step
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { text, mode } = req.body
      if (!text) {
        console.log('no post data')
        return res.status(400).json({ error: 'Text is required' })
      }
      const url = `${process.env.NEXT_PUBLIC_LOGOS_AI_API_URL}/analysis`
      const responseData = await gptPostHandler(url, { text: text, mode: mode })
      return res.status(200).json(responseData)
    } else {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error?.message ?? error })
    } else if (typeof error === 'string') {
      res.status(500).json({ error })
    } else if (typeof error === 'object' && error && 'message' in error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Unknown error' })
    }
  }
}

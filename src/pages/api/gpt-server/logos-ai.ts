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
  Highlight = 'Highlight', //final step
  CleanMarkdown = 'CleanMarkdown', //final step
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { text, mode } = req.body
      if (!text) {
        console.log('no post data')
        return res.status(400).json({ error: 'Text is required' })
      }
      const url = `${process.env.NEXT_LOGOS_AI_API_URL}/analysis`
      const responseData = await gptPostHandler(url, { text: text, mode:mode})
      return res.status(200).json(responseData)
    } else {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({ error: error.message })
  }
}

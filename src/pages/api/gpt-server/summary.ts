import type { NextApiRequest, NextApiResponse } from 'next'
import { postHandler } from '@pages/api/discourse/helper'

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
  if (req.method === 'POST') {
    console.log('request received', req.body)
    const { text } = req.body
    if (!text) {
      console.log('no post data')
      return res.status(400).json({ error: 'Text is required' })
    }

    const url = `${process.env.NEXT_LOGOS_AI_API_URL}/analysis`
    return await postHandler(res)(url, { input: text, mode: Template.Summarize })

    // return response
  } else {
    // Handle methods other than POST
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

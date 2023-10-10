import { postHandler } from '@pages/api/discourse/helper'
import { NextApiRequest, NextApiResponse } from 'next/types'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { endpoint } = req.headers
    const url = `${endpoint || process.env.NEXT_PUBLIC_DISCOURSE_API_ENDPOINT}/posts.json`

    console.log(url)
    const response = await postHandler(req, res)(url, req.body)
    console.log(response)
    res.status(200).json(response.data)
  } else {
    // Handle any other HTTP method
  }
}

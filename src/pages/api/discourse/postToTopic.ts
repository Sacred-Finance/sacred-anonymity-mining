import { postHandler } from '@pages/api/discourse/helper'
import { NextApiRequest, NextApiResponse } from 'next/types'

export default async function handler(req, res) {
  console.log(req)

  if (req.method === 'POST') {
    const url = `${process.env.NEXT_PUBLIC_DISCOURSE_API_ENDPOINT}/posts.json`
   const response =  await postHandler(res)(url, req.body)
  } else {
    // Handle any other HTTP method
  }
}

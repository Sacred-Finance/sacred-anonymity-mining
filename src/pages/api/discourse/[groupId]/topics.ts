import type { NextApiRequest, NextApiResponse } from 'next'
import { getHandler } from '@pages/api/discourse/helper'

type Topic = {
  id: number
  title: string
  slug: string
  created_at: string
}

type ResponseData = {
  topics: Topic[]
}

// todo: NEXT_PUBLIC_DISCOURSE_API_ENDPOINT will need to come from a db or something

export default async function (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { endpoint } = req.headers
  const url = `${
    endpoint || process.env.NEXT_PUBLIC_DISCOURSE_API_ENDPOINT
  }/latest.json`

  console.log(req.headers)
  await getHandler(req, res)(url)
}

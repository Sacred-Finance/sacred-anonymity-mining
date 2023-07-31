import { postHandler } from '@pages/api/discourse/helper'
import { NextApiRequest, NextApiResponse } from 'next/types'

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { topic_id, raw } = req.body
  const url = `${process.env.NEXT_PUBLIC_DISCOURSE_API_ENDPOINT}/posts`
  const body = {
    topic_id,
    raw,
  }
  await postHandler(res)(url, body)
}

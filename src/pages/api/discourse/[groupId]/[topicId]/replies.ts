import { NextApiRequest, NextApiResponse } from 'next'
import { getHandler } from '@pages/api/discourse/helper'

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { topicId } = req.query
  const { endpoint } = req.headers
  const url = `${endpoint}/posts/${topicId}/replies.json`

  return await getHandler(req, res, true)(url)
}

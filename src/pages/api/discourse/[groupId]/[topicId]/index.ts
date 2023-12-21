import type { NextApiRequest, NextApiResponse } from 'next'
import { getHandler } from '@pages/api/discourse/helper'

type Data = {
  // properties based on the structure of your Discourse topic data
}

export default async function (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { topicId } = req.query
  const { endpoint } = req.headers
  const url = `${endpoint}/t/${topicId}.json`
  await getHandler(req, res)(url)
}

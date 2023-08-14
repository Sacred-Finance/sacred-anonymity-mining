import { NextApiRequest, NextApiResponse } from 'next'
import { getHandler } from '@pages/api/discourse/helper'


export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const url = `https://logos.discourse.group/posts/${id}/replies.json`

  return await getHandler(res, true)(url)
}

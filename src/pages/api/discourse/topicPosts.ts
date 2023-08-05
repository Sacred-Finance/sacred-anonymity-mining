import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import {  getHandler } from '@pages/api/discourse/helper'
type Data = {
  // properties based on the structure of your Discourse topic data
}

export default async function (req: NextApiRequest, res: NextApiResponse<Data>) {
  const { topic_id } = req.query
  const url = `https://logos.discourse.group/t/${topic_id}.json`
  await getHandler(res)(url)
}

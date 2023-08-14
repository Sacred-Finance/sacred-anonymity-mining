import type { NextApiRequest, NextApiResponse } from 'next'
import { getHandler } from '@pages/api/discourse/helper'

type Data = {
  // properties based on the structure of your Discourse topic data
}

export default async function (req: NextApiRequest, res: NextApiResponse<Data>) {
  const { id, post_ids } = req.query;

  console.log(id, post_ids)
  // Convert post_ids from string or string[] to an array of strings
  const postIdsArray = Array.isArray(post_ids) ? post_ids : post_ids?.split(',');

  // Append post_ids to the URL
  const url = `https://logos.discourse.group/t/${id}/posts.json?post_ids[]=${postIdsArray?.join('&post_ids[]=')}`;

  await getHandler(res)(url);
}

import { postHandler } from '@pages/api/discourse/helper'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const url = `${process.env.NEXT_PUBLIC_DISCOURSE_API_ENDPOINT}/posts.json`
    const response = await postHandler(res)(url, req.body)

    try {
      if (response) {
        console.log(response)
      }
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    // Handle any other HTTP method
  }
}

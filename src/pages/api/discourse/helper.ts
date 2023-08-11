import axios from 'axios'
import { NextApiResponse } from 'next/types'

export function discourseAuthenticationHeaders() {
  return {
    headers: {
      'Api-Key': process.env.NEXT_PUBLIC_DISCOURSE_API_KEY,
      'Api-Username': process.env.NEXT_PUBLIC_DISCOURSE_API_USERNAME,
    },
  }
}

export const getHandler = (res: NextApiResponse) => async (url: string) => {
  try {
    const response = await axios.get(url, discourseAuthenticationHeaders() )
    res.status(200).json(response.data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const postHandler = (res: NextApiResponse) => async (url: string, body: any) => {
  try {
    console.log('postHandler',url, body)
    const response = await axios.post(url, body,  discourseAuthenticationHeaders() )
    console.log('postHandler',response)
    res.status(200).json(response.data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

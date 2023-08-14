import axios from 'axios'
import { NextApiResponse } from 'next/types'
import qs from 'qs'; // You might need to install this package

export const getHandler = (res: NextApiResponse) => async (url: string) => {
  try {
    const response = await axios.get(url, discourseAuthenticationHeaders())
    res.status(200).json(response.data)
  } catch (error) {
    console.error('Error fetching data:', error) // Log the error with details
    res.status(500).json({ error: error.message })
  }
}

export const postHandler =
    (res: NextApiResponse) =>
        async (url: string, body: any) => {
          try {
            const formattedBody = qs.stringify(body);
            const response = await axios.post(url, formattedBody, {
              headers: {
                ...discourseAuthenticationHeaders().headers,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': '*/*',
                'X-Requested-With': 'XMLHttpRequest',
              },
            });

            res.status(200).json(response.data);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        };

export function discourseAuthenticationHeaders() {
  return {
    headers: {
      'Api-Key': process.env.NEXT_PUBLIC_DISCOURSE_API_KEY,
      'Api-Username': process.env.NEXT_PUBLIC_DISCOURSE_API_USERNAME,
    },
  };
}

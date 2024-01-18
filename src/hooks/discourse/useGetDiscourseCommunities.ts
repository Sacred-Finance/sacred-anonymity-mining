import useSWR from 'swr'
import type { DiscourseCommunity } from '@/lib/model'

export const useGetDiscourseCommunities = (): {
  data: DiscourseCommunity[] | undefined
  error: Error
  isValidating: boolean
} => {
  const { data, error, isValidating } = useSWR(process.env.NEXT_PUBLIC_DISCOURSE_GOOGLE_SHEET_API_URL as string)
  return {
    data: data?.communities,
    error,
    isValidating,
  }
}

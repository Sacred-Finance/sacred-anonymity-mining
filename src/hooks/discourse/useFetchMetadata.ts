import { use, useEffect, useState } from 'react'
import axios from 'axios'

export const useFetchMetadata = groupId => {
  const [community, setCommunity] = useState<{
    name: string
    description: string
    image: string
    readonly: boolean
  }>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const fetchMetadata = async () => {
      const { data } = await axios.get(`/api/discourse/${groupId}/metadata`)
      setCommunity({
        name: data['og:title'],
        description: data['og:description'],
        image: data['og:image'],
        readonly: data['readonly'] ?? false,
      })
      setLoading(false)
    }
    fetchMetadata()
  }, [])
  return { community, loading }
}

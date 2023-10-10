import { use, useEffect, useState } from "react"
import axios from "axios";

export const useFetchMetadata = (id) => {
  const [community, setCommunity] = useState<{
    name: string
    description: string
    image: string
  }>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const fetchMetadata = async () => {
      const { data } = await axios.get(`/api/discourse/${id}/metadata`)
      setCommunity({
        name: data['og:title'],
        description: data['og:description'],
        image: data['og:image'],
      })
      setLoading(false)
    }
    fetchMetadata()
  }, [])
  return { community, loading }
}
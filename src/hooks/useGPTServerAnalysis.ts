import { useState } from 'react'
import axios from 'axios'
import { Template } from '@pages/api/gpt-server/logos-ai'

interface GPTServerAnalysisOptions {
  postData: string
  template: Template
}

interface GPTServerAnalysisResponse {
  isLoading: boolean
  data: any
  error: string | null
  fetchData: () => void
}

export const useGPTServerAnalysis = ({ postData, template }: GPTServerAnalysisOptions): GPTServerAnalysisResponse => {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.post('/api/gpt-server/logos-ai', { text: postData, mode: template })
      setData(response.data)
    } catch (error) {
      console.log('error', error)
      setError('Error fetching data')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    data,
    error,
    fetchData,
  }
}

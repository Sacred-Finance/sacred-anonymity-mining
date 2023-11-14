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
  fetchData: (setter: (data: any) => void) => Promise<void>
}
export const useGPTServerAnalysis = (analyses: GPTServerAnalysisOptions[]): GPTServerAnalysisResponse[] => {
  const [isLoading, setIsLoading] = useState<boolean[]>(Array(analyses.length).fill(false));
  const [data, setData] = useState<any[]>(Array(analyses.length).fill(null));
  const [error, setError] = useState<string | null[]>(Array(analyses.length).fill(null));

  const fetchData = async (index: number, setDataFunction?: (data: any) => void) => {
    setIsLoading(prev => {
      const newArr = [...prev];
      newArr[index] = true;
      return newArr;
    });
    setError(prev => {
      const newArr = [...prev];
      newArr[index] = null;
      return newArr;
    });

    try {
      const response = await axios.post('/api/gpt-server/logos-ai', {
        text: analyses[index].postData,
        mode: analyses[index].template,
      });

      const newData = response?.data;

      if (setDataFunction) {
        setDataFunction(newData);
      } else {
        setData(prev => {
          const newArr = [...prev];
          newArr[index] = newData;
          return newArr;
        });
      }
    } catch (e) {
      setError(prev => {
        const newArr = [...prev];
        newArr[index] = 'Error fetching data';
        return newArr;
      });
    } finally {
      setIsLoading(prev => {
        const newArr = [...prev];
        newArr[index] = false;
        return newArr;
      });
    }
  };

  return analyses.map((_, index) => ({
    template: analyses[index].template,
    isLoading: isLoading[index],
    data: data[index],
    error: error[index],
    fetchData: (setDataFunction?: (data: any) => void) => fetchData(index, setDataFunction),
  }));
}

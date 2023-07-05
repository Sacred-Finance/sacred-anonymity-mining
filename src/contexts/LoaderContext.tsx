import React, { createContext, ReactNode, useContext, useState } from 'react'

interface LoaderContextValue {
  isLoading: boolean
  setIsLoading: (value: boolean) => void
}

interface LoaderProviderProps {
  children: ReactNode
}
const LoaderContext = createContext<LoaderContextValue | null>(null)

export const useLoaderContext = () => {
  const context = useContext(LoaderContext)
  if (!context) {
    throw new Error('useLoaderContext must be used within a LoaderProvider')
  }
  return context
}

export const LoaderProvider: React.FC<LoaderProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)

  return <LoaderContext.Provider value={{ isLoading: isLoading, setIsLoading }}>{children}</LoaderContext.Provider>
}

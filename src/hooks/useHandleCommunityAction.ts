import { useCallback, useContext } from 'react'
import { useLoaderContext } from '../contexts/LoaderContext'
import { toast } from 'react-toastify'

export const useHandleCommunityAction = () => {
  const { setIsLoading } = useLoaderContext()

  return useCallback(
    async (
      actionFn: (...args: any[]) => Promise<any>,
      actionParams: any[],
      successMessage: string,
      successCallback?: () => void
    ) => {
      try {
        setIsLoading(true)
        const response = await actionFn(...actionParams)

        if (!response) {
          toast.warning('no response from Relayer - this may not be a problem', {
            autoClose: 7000,
          })
        }

        const { status, data } = response

        if (status === 200) {
          toast.success(successMessage, {
            autoClose: 7000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          })
          if (successCallback) successCallback()
        } else {
          console.error('Error in action')
        }
        setIsLoading(false)
      } catch (error) {
        console.error('error in action', error)
        setIsLoading(false)
      }
    },
    [toast, setIsLoading]
  )
}

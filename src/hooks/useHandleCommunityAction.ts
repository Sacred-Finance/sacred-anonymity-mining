import { useCallback } from 'react'
import { toast } from 'react-toastify'

export const useHandleCommunityAction = () => {
  return useCallback(
    async (
      actionFn: (...args: any[]) => Promise<any>,
      actionParams: any[],
      successMessage: string,
      successCallback?: () => void
    ) => {
      try {
        const response = await actionFn(...actionParams)

        if (!response) {
          toast.warning(
            'no response from Relayer - this may not be a problem',
            {
              autoClose: 7000,
            }
          )
        }

        const { status, data } = response

        if (status === 200) {
        // todo: handle
          if (successCallback) {
            successCallback()
          }
        } else {
          console.error('Error in action')
        }
      } catch (error) {
        console.error('error in action', error)
        toast.error(error.name, {
          autoClose: 7000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          toastId: 'handleCommunity',
        } as any)
      }
    },
    [toast]
  )
}

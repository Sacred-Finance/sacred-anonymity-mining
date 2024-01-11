import { useCallback } from 'react'
import { toast } from 'react-toastify'

export const useHandleCommunityAction = () => {
  return useCallback(
    async (
      actionFn: (...args: never[]) => Promise<never>,
      actionParams: never[],
      successMessage: string,
      successCallback?: () => void
    ) => {
      try {
        const response = await actionFn(...actionParams)

        if (!response) {
          toast.warning('no response from Relayer - this may not be a problem', {
            autoClose: 7000,
          })
        }

        const { status } = response

        if (status === 200) {
          // todo: handle
          if (successCallback) {
            successCallback()
          }
        } else {
          console.error('Error in action')
        }
      } catch (error) {
        if (error instanceof Error) {
          return toast.error(error.message)
        } else {
          toast.error('Something went wrong. Please try again later.', {
            autoClose: 7000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            toastId: 'handleCommunity',
          })
        }
      }
    },
    [toast]
  )
}

import { Community } from '../lib/model'
import { ethers } from 'ethers'
import { useCallback, useState } from 'react'
import { validateUserBalance, ValidationResult } from './validateUserBalance'
import { toast } from 'react-toastify'
import { useProvider } from 'wagmi'

export const useValidateUserBalance = (
  community: Community | undefined,
  address: `0x${string}` | undefined,
  provider
) => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const checkUserBalance = useCallback(async () => {
    if (!community || !address) return false

    if (!address) {
      toast.warning('No wallet connected', {
        autoClose: 7000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return false
    }

    const { hasSufficientBalance, toastMessage } = await validateUserBalance(community, address, provider)

    if (!hasSufficientBalance) {
      toast.warning(`Insufficient Balance`, {
        autoClose: 7000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }

    setValidationResult({ hasSufficientBalance, toastMessage })
    return hasSufficientBalance
  }, [community, address])

  return { validationResult, checkUserBalance }
}

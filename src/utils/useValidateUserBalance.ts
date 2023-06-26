import { useContractReads } from 'wagmi'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { erc20dummyABI } from '../constant/const'
import { Community } from '../lib/model'

interface RequirementCheck {
  symbol: string | undefined
  minAmount: number
  balance: number
  decimals: number | undefined
}
export interface ValidationResult {
  hasSufficientBalance: boolean
  toastMessage: string
}

export const useValidateUserBalance = (community: Community | undefined, address: `0x${string}` | undefined) => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [fetchEnabled, setFetchEnabled] = useState(false)

  const requirements =
    community?.requirements?.length && address && community?.chainId
      ? community.requirements.map(r => ({
          address: r.tokenAddress,
          abi: erc20dummyABI,
          functionName: 'balanceOf',
          args: [address],
          chainId: community.chainId,
        }))
      : []

  const isEnabled = useMemo(() => {
    return (
      fetchEnabled && !!community?.requirements?.length && !!address && !!community?.chainId && requirements.length > 0
    )
  }, [fetchEnabled, community, address, requirements])

  const { data, isError, isLoading } = useContractReads({
    contracts: requirements,
    cacheOnBlock: true,
    cacheTime: 10_000,
    allowFailure: true,
    autoReload: true,
    enabled: isEnabled,

    onError(error) {
      console.log('error validate balance check', error)
    },
    onSuccess(data) {
      console.log(
        'success validate balance check',
        data,
        community?.requirements?.length,
        address,
        community?.chainId,
        community?.groupId
      )
    },
  })

  useEffect(() => {
    console.log('useEffect', { data, isError, isLoading })
    if (!isLoading && (isError || data)) {
      setFetchEnabled(false)
    }
  }, [data, isError, isLoading])

  const checkUserBalance = useCallback(() => {
    let toastMessage = ''
    let requirementsMet: RequirementCheck[] = []

    if (!community?.requirements.length) {
      return true
    }

    if (data && !isError && !isLoading) {
      requirementsMet = data.map((bal, i) => {
        const r = community.requirements[i]
        if (Number(bal) < Number(r.minAmount)) {
          toastMessage += `Insufficient ${r?.symbol} \n`
        }
        return {
          balance: Number(bal),
          symbol: r.symbol,
          minAmount: Number(r.minAmount),
          decimals: r.decimals,
        }
      })

      console.log('requirementsMet', requirementsMet)
      const hasSufficientBalance = requirementsMet.every(e => e.balance >= e.minAmount / 10 ** e.decimals)
      console.log('hasSufficientBalance', hasSufficientBalance)

      if (!hasSufficientBalance) {
        toast.warning(`Insufficient Balance`, {
          containerId: 'toast',
          autoClose: 7000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          toastId: 'insufficient-balance',
        })
      }

      setValidationResult({ hasSufficientBalance, toastMessage })
      return hasSufficientBalance
    }
    setFetchEnabled(true)

    console.log('checking balance', data, isError, isLoading)
  }, [community, data, isError, isLoading])

  useEffect(() => {
    if (data === undefined && !isError && !isLoading) {
      console.log('checking balance - in effect', data, isError, isLoading)
      checkUserBalance()
    }
  }, [data, isError, isLoading, checkUserBalance])

  return { validationResult, checkUserBalance }
}

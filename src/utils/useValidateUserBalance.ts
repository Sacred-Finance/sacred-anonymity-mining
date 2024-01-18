import type { Address } from 'wagmi'
import { useContractReads } from 'wagmi'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import type { Group } from '@/types/contract/ForumInterface'
import { erc20dummyABI } from '@/constant/erc20dummyABI'

interface ValidationResult {
  hasSufficientBalance: boolean
  toastMessage: string
}

export const useValidateUserBalance = (community: Group | undefined, address: Address | undefined) => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [fetchEnabled, setFetchEnabled] = useState(false)

  const requirements = useMemo(() => {
    if (!community?.requirements?.length || !address || !community?.chainId) {
      return []
    }
    return community.requirements.map(r => ({
      address: r.tokenAddress,
      abi: erc20dummyABI,
      functionName: 'balanceOf',
      args: [address],
      chainId: community.chainId,
    }))
  }, [community, address])

  const isEnabled = useMemo(() => fetchEnabled && requirements.length > 0, [fetchEnabled, requirements])

  const { data, isError, isLoading } = useContractReads({
    contracts: requirements.filter(Boolean),
    cacheOnBlock: true,
    cacheTime: 10_000,
    allowFailure: true,
    autoReload: true,
    enabled: isEnabled,
    onError: error => console.error('Error during balance check', error),
    onSuccess: data => console.log('Balance check successful', data),
  })

  useEffect(() => {
    if (!isLoading && (isError || data)) {
      setFetchEnabled(false)
    }
  }, [data, isError, isLoading])

  const checkUserBalance = useCallback(() => {
    if (!community?.requirements?.length) {
      return true
    }

    if (!data || isError || isLoading) {
      setFetchEnabled(true)
      return
    }

    let toastMessage = ''
    const requirementsMet = data.map((bal, i) => {
      const requirement = community.requirements[i]
      const balance = Number(bal)
      const minAmount = Number(requirement.minAmount)
      if (balance < minAmount) {
        toastMessage += `Insufficient ${requirement?.symbol} \n`
      }
      return {
        balance,
        symbol: requirement.symbol,
        minAmount,
        decimals: requirement.decimals,
      }
    })

    const hasSufficientBalance = requirementsMet.every(e => e.balance >= e.minAmount / 10 ** e.decimals)

    if (!hasSufficientBalance) {
      toast.warning(`Insufficient Balance`)
    }

    setValidationResult({ hasSufficientBalance, toastMessage })
    return hasSufficientBalance
  }, [community, data, isError, isLoading])

  useEffect(() => {
    if (data === undefined && !isError && !isLoading) {
      checkUserBalance()
    }
  }, [data, isError, isLoading, checkUserBalance])

  return { validationResult, checkUserBalance }
}

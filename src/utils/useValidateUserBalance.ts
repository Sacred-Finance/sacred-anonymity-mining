import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {erc20dummyABI, supportedChains} from '../constant/const'
import { ethers } from 'ethers'
import { Community } from '../lib/model'
import { useProvider } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'

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
  const wagmiProvider = useProvider({ chainId: polygonMumbai.id })
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const checkUserBalance = useCallback(async () => {
    if (!community || !address || !wagmiProvider) return

    console.log( 'community', community,address )
    let toastMessage = ''
    let requirementsMet: RequirementCheck[] = []

    // environment variable
    const provider = new ethers.providers.JsonRpcProvider(supportedChains[community.chainId].rpcUrls.public.http[0])

    const requirements = community.requirements || []

    for (let i = 0; i < requirements.length; i++) {
      const r = requirements[i]
      const contract = new ethers.Contract(r.tokenAddress, erc20dummyABI, provider)
      const bal = await contract.balanceOf(address)

      if (Number(bal) < Number(r.minAmount)) {
        toastMessage += `Insufficient ${r?.symbol} \n`
      }

      requirementsMet.push({
        balance: Number(bal),
        symbol: r.symbol,
        minAmount: Number(r.minAmount),
        decimals: r.decimals,
      })
    }

    const hasSufficientBalance = requirementsMet.every(e => e.balance >= e.minAmount / 10 ** e.decimals)

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
  }, [community, address, wagmiProvider])



  return { validationResult, checkUserBalance }
}

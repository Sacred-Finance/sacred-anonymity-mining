// @ts-nocheck
import { Community } from '../lib/model'
import { ethers } from 'ethers'
import { erc20dummyABI, supportedChains } from '../constant/const'

export interface ValidationResult {
  hasSufficientBalance: boolean
  toastMessage: string
}

interface RequirementCheck {
  balance: number
  symbol: string
  minAmount: number
  decimals?: number
}

export const validateUserBalance = async (
  community: Community | undefined,
  address: string,
  provider: ethers.providers.JsonRpcProvider
): Promise<ValidationResult> => {
  let toastMessage = ''
  let requirementsMet: RequirementCheck[] = []

  if (community?.requirements?.length) {
    const mappedR: Promise<RequirementCheck>[] = community.requirements.map(async r => {
      const tokenContract = new ethers.Contract(r.tokenAddress, erc20dummyABI, provider)
      const bal = await tokenContract.balanceOf(address)
      if (Number(bal) < Number(r.minAmount)) {
        toastMessage += `Insufficient ${r?.symbol} \n`
      }
      return {
        balance: Number(bal),
        symbol: r.symbol,
        minAmount: Number(r.minAmount),
        decimals: r?.decimals,
      }
    })

    requirementsMet = await Promise.all(mappedR)
  }

  const hasSufficientBalance = requirementsMet.every(e => e.balance >= e.minAmount / 10 ** e.decimals)

  return { hasSufficientBalance, toastMessage }
}

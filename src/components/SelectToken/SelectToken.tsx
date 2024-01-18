import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useFetchTokensList } from '@/hooks/useFetchTokensList'
import Image from 'next/image'
import { chainLogos, supportedChainsArray } from '@/constant/const'
import { polygonMumbai } from 'wagmi/chains'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shad/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shad/ui/dropdown-menu'
import uriToHttp from '@/utils/uriToHttp'
import { FaCaretRight } from 'react-icons/fa'

const ChainSelector = ({ chainId, setChainId }) => {
  return (
    <Select
      onValueChange={value => {
        setChainId(value)
      }}
      value={chainId.toString()}
    >
      <SelectTrigger className="sticky top-0 z-50 w-full">
        <SelectValue placeholder="Select Chain" />
      </SelectTrigger>
      <SelectContent>
        {supportedChainsArray.map(chain => (
          <SelectItem key={chain.id} value={chain.id.toString()}>
            <div className="flex items-center gap-2">
              <Image src={chainLogos[chain.id]} alt="" height={24} width={24} />
              <span> {chain.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const SelectToken = ({ fieldName, fieldIndex }) => {
  const { control, setValue, watch } = useFormContext()
  const [chainId, setChainId] = React.useState(polygonMumbai.id)
  const { filteredTokensList, onSearch } = useFetchTokensList(chainId)
  const formSelector = `${fieldName}.${fieldIndex}`
  const token = watch(formSelector)

  const appendToken = selectedToken => {
    setValue(formSelector, { ...token, ...selectedToken }, { shouldValidate: false, shouldDirty: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className="flex h-full min-w-[200px] items-center justify-between gap-2 rounded border bg-background p-2 text-foreground"
      >
        <Image hidden={!token?.logoURI} src={uriToHttp(token?.logoURI)} alt={token?.name} height={24} width={24} />
        {token?.name ? token?.name : 'Select Token'}
        <FaCaretRight className={'transform transition-transform duration-150 ' + (token?.name ? 'rotate-90' : '')} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-[400px] overflow-y-auto">
        <ChainSelector chainId={chainId} setChainId={setChainId} />
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Token</DropdownMenuLabel>
        <Controller
          control={control}
          name={formSelector}
          render={({ field }) =>
            filteredTokensList.map(token => (
              <DropdownMenuItem
                key={token.address}
                onSelect={() => {
                  appendToken(filteredTokensList.find(tokenItem => tokenItem.address === token.address))
                }}
              >
                <div className="flex items-center gap-2">
                  <Image src={uriToHttp(token.logoURI)} alt={token.name} height={24} width={24} />
                  <span>{token.name}</span>
                </div>
              </DropdownMenuItem>
            ))
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SelectToken

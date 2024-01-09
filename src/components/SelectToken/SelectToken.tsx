import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useFetchTokensList } from '@/hooks/useFetchTokensList'
import uriToHttp from '@/utils/uriToHttp'
import Image from 'next/image'
import { chainLogos, supportedChainsArray } from '@/constant/const'
import { polygonMumbai } from 'wagmi/chains'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shad/ui/select'

const ChainSelector = ({ chainId, setChainId }) => {
  return (
    <Select
      onValueChange={value => {
        setChainId(value)
      }}
      value={chainId.toString()}
    >
      <SelectTrigger>
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
    <div>
      <Controller
        control={control}
        name={formSelector}
        render={({ field }) => (
          <Select
            {...field}
            onValueChange={value => appendToken(filteredTokensList.find(token => token.address === value))}
            value={field.value?.address || ''}
          >
            <SelectTrigger className="flex w-[200px]">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Chain</SelectLabel>
                <ChainSelector chainId={chainId} setChainId={setChainId} />
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Token</SelectLabel>
                {filteredTokensList.map(token => (
                  <SelectItem key={token.address} value={token.address}>
                    <div className="flex items-center gap-2">
                      <Image src={uriToHttp(token.logoURI)} alt={token.name} height={24} width={24} />
                      <span>{token.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
    </div>
  )
}

export default SelectToken

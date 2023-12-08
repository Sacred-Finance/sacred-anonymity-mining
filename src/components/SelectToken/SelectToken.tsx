import React, { useState } from 'react'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { useFetchTokensList } from '@/hooks/useFetchTokensList'
import uriToHttp from '@/utils/uriToHttp'
import Image from 'next/image'
import { useOutsideClickHandler } from '@/hooks/useOutsideClickHandler'

interface SelectTokenProps {
  chainId: number
  onTokenSelect: (tokenAddress, symbol, decimals) => void
  selectedToken?: string
}

const SelectToken = ({
  chainId,
  selectedToken,
  onTokenSelect,
}: SelectTokenProps) => {
  const [optionsVisible, setOptionsVisible] = useState(false)
  const { filteredTokensList, onSearch } = useFetchTokensList(chainId)
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(-1)
  // on click outside of modal, close modal
  const ref = React.useRef<HTMLDivElement>(null)
  useOutsideClickHandler(ref.current, () => setOptionsVisible(false))
  return (
    <div ref={ref} className="w-full">
      <button
        id="dropdownSearchButton"
        onClick={() => setOptionsVisible(!optionsVisible)}
        className="text-md inline-flex w-full items-center rounded-lg border border-gray-400 px-4 py-2 text-center font-medium focus:outline-none dark:border-gray-600 dark:bg-gray-700"
        type="button"
      >
        <span className="flex items-center gap-2 dark:text-white">
          {selectedToken && selectedTokenIndex > -1 && (
            <Image
              src={uriToHttp(filteredTokensList[selectedTokenIndex]?.logoURI)}
              alt={filteredTokensList[selectedTokenIndex]?.name}
              height={25}
              width={25}
            />
          )}
          {selectedToken && selectedTokenIndex > -1
            ? filteredTokensList[selectedTokenIndex]?.name
            : 'Select Token'}
        </span>
        {optionsVisible ? (
          <ChevronUpIcon
            className="-mr-1 ml-auto h-5 w-5 dark:text-white"
            aria-hidden="true"
          />
        ) : (
          <ChevronDownIcon
            className="-mr-1 ml-auto h-5 w-5 dark:text-white"
            aria-hidden="true"
          />
        )}
      </button>

      {optionsVisible && (
        <div
          id="dropdownSearch"
          className="absolute z-10 mt-2 w-[400px] rounded-lg border border-gray-300 bg-white shadow dark:bg-gray-700"
        >
          <div className="p-3">
            <label htmlFor="input-group-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                id="input-group-search"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="Search name or paste address"
                onChange={e => onSearch(e.target.value)}
              />
            </div>
          </div>
          <ul
            className="h-48 overflow-y-auto px-3 pb-3 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownSearchButton"
          >
            {filteredTokensList?.map((t: any, i) => (
              <li
                key={`${t?.name}_${i}`}
                className="cursor-pointer"
                onClick={() => {
                  onTokenSelect(t?.address, t?.symbol, t?.decimals)
                  setSelectedTokenIndex(i)
                  setOptionsVisible(false)
                }}
              >
                <a className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  <img
                    className="mr-2 h-6 w-6 rounded-full"
                    src={uriToHttp(t?.logoURI)}
                    alt={t?.name}
                  />
                  {t?.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SelectToken

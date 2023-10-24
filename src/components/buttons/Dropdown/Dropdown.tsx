import React from 'react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'

interface DropdownProps {
  disabled?: boolean
  options?: { key: string; value: any; image?: string }[]
  onSelect: (value: any) => void
  selected: { key: string; value: any; image?: string }
}

const Dropdown = ({ disabled = false, options, selected, onSelect }: DropdownProps) => {
  return (
    <div className="group text-gray-700 dark:text-gray-200">
      <button
        disabled={disabled}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-2 py-1 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
      >
        <div className="flex gap-2 items-center">
          {selected?.image && (
            <Image src={selected.image} alt={'ChainLogo'} width={'20'} height={'20'} style={{height: 20, width: 20}} className="rounded" />
          )}{' '}
          {selected.key}
        </div>
        <ChevronRightIcon
          className="h-5 w-5 transform transition-transform duration-200 group-hover:rotate-90"
          aria-hidden="true"
        />
      </button>

      <div className="absolute left-auto z-50 hidden w-48 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block dark:bg-gray-700">
        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          {options?.map((k, i) => (
            <button
              key={k.key}
              className="w-full px-3 py-2 text-left  hover:bg-gray-200 focus:outline-none dark:hover:bg-gray-500"
              onClick={() => onSelect(k.value)}
            >
              <div className="flex gap-2 items-center">
                {k?.image && <Image src={k.image} alt={'ChainLogo'} width={25} height={25} className="rounded" />}{' '}
                {k.key}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dropdown

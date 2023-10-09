import React from 'react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'

interface DropdownProps {
  disabled?: boolean
  options?: { key: string; value: any }[]
  onSelect?: (value: any) => void
  selected: { key: string; value: any }
}

const Dropdown = ({ disabled = false, options, selected, onSelect }: DropdownProps) => {
  return (
    <div className='group'>
      <button
        disabled={disabled}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-700 focus:outline-none"
      >
        {selected.key}
        <ChevronRightIcon
          className="h-5 w-5 transform transition-transform duration-200 group-hover:rotate-90"
          aria-hidden="true"
        />
      </button>

      <div className="absolute left-auto z-50 hidden w-48 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          {options.map((k, i) => (
            <button
              key={k.key}
              className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-200 focus:outline-none"
              onClick={() => onSelect(k.value)}
            >
              {k.key}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dropdown

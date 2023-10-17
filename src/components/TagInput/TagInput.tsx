import React, { SyntheticEvent, useState } from 'react'
import clsx from 'clsx'
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { difference } from 'lodash'
import { TAGS } from '@/constant/tags'

interface TagInputProps {
  onChange: (tags: string[]) => void
  selected: string[]
}

const TagInput = ({ onChange, selected }: TagInputProps) => {
  const [options, setOptions] = useState(TAGS)
  const [optionsVisible, setOptionsVisible] = useState(false)

  const filterTags = e => {
    const value = e.target.value.toLowerCase()
    if (!value) {
      setOptions(difference(TAGS, selected))
      return
    }
    const filtered = options.filter(tag => tag.toLowerCase().includes(value))
    setOptions(filtered)
    return
  }

  const onTagSelect = (event: SyntheticEvent, t: string, index) => {
    onChange([...selected, t])
    setOptions(options.filter(tag => tag !== t))
  }

  const removeTag = (t: string, index) => {
    onChange(selected.filter(tag => tag !== t))
    setOptions([...options, t])
  }

  return (
    <div className="flex h-auto w-full flex-col items-center">
      <div className="relative flex w-full flex-col items-center pb-4">
        <div className="w-full">
          <div className="my-2 w-full flex rounded border border-gray-200 bg-white p-1">
              <div className="flex w-full flex-col">
                <div className='flex flex-row'>
                  {selected?.map((tag, index) => (
                    <div
                      key={`${tag}_${index}`}
                      className="border-slate-500 m-1 flex items-center justify-center rounded-full border bg-slate-300 px-2 py-1 font-medium text-black"
                    >
                      <div className="max-w-full flex-initial text-xs font-normal leading-none">{tag}</div>
                      <div className="flex flex-auto flex-row-reverse">
                        <div className="cursor-pointer">
                          <XMarkIcon className="ml-1 h-4 w-4" onClick={() => removeTag(tag, index)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mr-1 flex-1">
                  <input
                    placeholder="Search Tags"
                    onChange={filterTags}
                    onFocus={() => setOptionsVisible(true)}
                    className="h-full w-full appearance-none rounded-[10px] border-solid border-slate-300 bg-transparent p-1 px-2 text-gray-800 outline-none"
                  />
                </div>
              </div>
              <div
                className="flex w-8 cursor-pointer items-center border-l border-gray-200 py-1 pl-2 pr-1 text-gray-300"
                onClick={() => setOptionsVisible(!optionsVisible)}
              >
                {!optionsVisible ? <ChevronDownIcon /> : <ChevronUpIcon />}
              </div>
          </div>
          <div className="lef-0 max-h-select absolute z-40 w-full overflow-y-auto rounded bg-white shadow">
            <div className="flex w-full flex-col max-h-[300px]">
              {optionsVisible &&
                options.map((o, i) => (
                  <div
                    key={`${o}_${i + 1}`}
                    onClick={e => onTagSelect(e, o, i)}
                    className="w-full cursor-pointer rounded-t border-b border-gray-100 hover:bg-slate-200"
                  >
                    <div
                      className={clsx(
                        true && 'border-primary-600',
                        'relative flex w-full items-center border-l-2 border-transparent p-2 pl-2'
                      )}
                    >
                      <div className="flex w-full items-center">
                        <div className="mx-2 leading-6"> {o} </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TagInput

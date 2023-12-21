import type { SyntheticEvent } from 'react'
import React, { useState } from 'react'
import clsx from 'clsx'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { difference } from 'lodash'
import { TAGS } from '@/constant/tags'
import { useOutsideClickHandler } from '@/hooks/useOutsideClickHandler'

interface TagInputProps {
  onChange: (tags: string[]) => void
  selected: string[]
}

const TagInput = ({ onChange, selected }: TagInputProps) => {
  const [options, setOptions] = useState(TAGS)
  const [optionsVisible, setOptionsVisible] = useState(false)
  // on click outside of modal, close modal
  const ref = React.useRef<HTMLDivElement>(null)
  useOutsideClickHandler(ref.current, () => setOptionsVisible(false))

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
          <div className="my-2 flex w-full rounded border border-gray-400 bg-white p-1 dark:border-gray-600 dark:bg-gray-700">
            <div className="flex w-full flex-col gap-2">
              <div className="flex flex-row">
                {selected?.map((tag, index) => (
                  <div
                    key={`${tag}_${index}`}
                    className="m-1 flex items-center justify-center rounded-full border border-slate-500 bg-slate-300 px-2 py-1 font-medium text-black"
                  >
                    <div className="max-w-full flex-initial text-xs font-normal leading-none">
                      {tag}
                    </div>
                    <div className="flex flex-auto flex-row-reverse">
                      <div className="cursor-pointer">
                        <XMarkIcon
                          className="ml-1 h-4 w-4"
                          onClick={() => removeTag(tag, index)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mx-1 mb-1 flex-1">
                <input
                  placeholder="Search Tags"
                  onChange={filterTags}
                  onFocus={() => setOptionsVisible(true)}
                  className="h-full w-full appearance-none rounded-[10px] border-solid border-slate-300 bg-transparent p-1 px-2 text-gray-800 outline-none focus:border-primary dark:text-gray-200"
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
          {optionsVisible && (
            <div
              ref={ref}
              className="max-h-select absolute left-0 z-40 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow"
            >
              <div className="flex max-h-[300px] w-full flex-col">
                {options.map((o, i) => (
                  <div
                    key={`${o}_${i + 1}`}
                    onClick={e => onTagSelect(e, o, i)}
                    className="w-full cursor-pointer border-b border-gray-200 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    <div
                      className={clsx(
                        true && 'border-primary-600',
                        'relative flex w-full items-center border-l-2 border-transparent p-2'
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
          )}
        </div>
      </div>
    </div>
  )
}

export default TagInput

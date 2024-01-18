// AnalysisCheckboxComponent.js
import React, { useContext } from 'react'
import { Checkbox } from '@/shad/ui/checkbox'
import clsx from 'clsx'
import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { analysisLabelsAndTypes } from '@components/Post/AiAccordionConfig'
import { AIDigestContext } from '@components/Post/PostPage'

export const AnalysisCheckboxComponent = () => {
  const { enabled, setEnabled, responses } = useContext(AIDigestContext)

  const handleCheckboxChange = key => {
    // disabled if analysis has data
    if (responses[key]) {
      return
    }
    setEnabled({ ...enabled, [key]: !enabled[key] })
  }

  return (
    <>
      {analysisLabelsAndTypes.map(analysis => {
        const isChecked = enabled[analysis.key]
        const isComplete = !!responses[analysis.key]
        return (
          <div
            key={analysis.key}
            className={clsx(
              'rounded-xl border p-2 dark:border-gray-700/80 dark:bg-gray-950/20',
              'hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <label
              htmlFor={analysis.key}
              className={clsx('relative flex cursor-pointer flex-col gap-1', isComplete ? 'opacity-50' : '')}
              onClick={() => handleCheckboxChange(analysis.key)}
            >
              <span className="text-gray-700 dark:text-gray-300">{analysis.label}</span>
              <span className="text-xs text-gray-500 dark:text-gray-300">{analysis.description}</span>
              <Checkbox
                disabled={isComplete}
                className="absolute right-0 top-0 rounded-full"
                name={analysis.key}
                checked={isChecked}
              />
            </label>
          </div>
        )
      })}
      <div className="col-span-2 flex items-center gap-2 text-[10px] text-yellow-700">
        <ExclamationCircleIcon className="h-4 w-4" />
        These processes may take 1-2 minutes
      </div>
    </>
  )
}

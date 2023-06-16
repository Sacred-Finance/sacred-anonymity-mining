import React, { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { CogIcon } from '@heroicons/react/20/solid'

export type SortByOption = 'highest' | 'lowest' | 'controversial' | 'newest' | 'oldest'

interface SortByProps {
  onSortChange: (sortBy: SortByOption) => void
  targetType: 'comments' | 'posts'
}

const SortBy: React.FC<SortByProps> = ({ onSortChange, targetType }) => {
  const [selectedOption, setSelectedOption] = useState<SortByOption>('highest')
  const { t } = useTranslation()

  const handleChange = e => {
    const newOption = e.target.value as SortByOption
    setSelectedOption(newOption)
    onSortChange(newOption)
  }

  return (
    <div className="flex items-center space-x-2">
      <CogIcon width={12} className="text-gray-500 dark:text-gray-200" />
      <select
        value={selectedOption}
        className="rounded-md bg-white text-gray-900 shadow-sm hover:shadow-md dark:bg-gray-800 dark:text-gray-100"
        onChange={handleChange}
      >
        <option value="highest">{t('filter.highestUpVotes')}</option>
        <option value="lowest">{t('filter.lowestUpVotes')}</option>
        <option value="controversial">{t('filter.controversial')}</option>
        <option value="newest">{t('filter.newest')}</option>
        <option value="oldest">{t('filter.oldest')}</option>
      </select>
    </div>
  )
}

export default SortBy

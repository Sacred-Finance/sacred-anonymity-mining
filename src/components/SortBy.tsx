import React, { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shad/ui/select'

export type SortByOption =
  | 'highest'
  | 'lowest'
  | 'controversial'
  | 'newest'
  | 'oldest'
  | 'activity'
  | 'contentLength'
  | 'engagement'

interface SortByProps {
  onSortChange: (sortBy: SortByOption) => void
}

const SortBy: React.FC<SortByProps> = ({ onSortChange }) => {
  const [selectedOption, setSelectedOption] = useState<SortByOption>('lowest')
  const { t } = useTranslation()

  const handleChange = (value: SortByOption) => {
    setSelectedOption(value)
    onSortChange(value)
  }

  return (
    <div className="flex items-center space-x-2 self-end">
      <Select onValueChange={handleChange} value={selectedOption}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('filter.placeholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="highest">{t('filter.highestUpVotes')}</SelectItem>
          <SelectItem value="lowest">{t('filter.lowestUpVotes')}</SelectItem>
          <SelectItem value="controversial">{t('filter.controversial')}</SelectItem>
          <SelectItem value="newest">{t('filter.newest')}</SelectItem>
          <SelectItem value="oldest">{t('filter.oldest')}</SelectItem>
          <SelectItem value="activity">{t('filter.mostActive')}</SelectItem>
          <SelectItem value="contentLength">{t('filter.longestContent')}</SelectItem>
          <SelectItem value="engagement">{t('filter.mostEngaged')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default SortBy

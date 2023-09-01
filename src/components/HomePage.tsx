import React, { useEffect, useMemo, useState } from 'react'
import { debounce } from 'lodash'
import { CommunityCard } from '../components/CommunityCard/CommunityCard'
import { useTranslation } from 'next-i18next'
import { getGroupIdOrUserId } from '../contexts/CommunityProvider'
import {
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  MinusCircleIcon,
  UserGroupIcon,
  UserMinusIcon,
} from '@heroicons/react/20/solid'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Group } from '@/types/contract/ForumInterface'
import { User } from '@/lib/model'
import AllTopics from '@components/Discourse/AllTopics'
import { Tab } from '@headlessui/react'

interface HomeProps {
  isAdmin: boolean
  communities: Group[]
}
const filterButtonClass = 'rounded-md p-2 text-white transition-colors duration-200 ease-in-out dark:bg-gray-900 '
const iconClass = 'h-5 w-5 fill-inherit stroke-inherit text-gray-500 dark:fill-white'
const tabClass = selected =>
  clsx(
    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 ',
    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
    selected ? 'bg-primary-500 text-white shadow' : 'text-blue-700 hover:bg-white/[0.12] hover:text-white'
  )

const FilterButton = ({ filterKey, iconTrue, iconFalse, applyFilter, currentFilter, filterClass, iconClass }) => {
  const IconTrue = iconTrue
  const IconFalse = iconFalse

  return (
    <button
      onClick={() => applyFilter(filterKey)}
      className={clsx(filterClass, currentFilter.includes(filterKey) && '!bg-primary-bg !fill-white')}
    >
      {currentFilter === `-${filterKey}` ? <IconTrue className={iconClass} /> : <IconFalse className={iconClass} />}
    </button>
  )
}
function HomePage({ isAdmin = false, communities }: HomeProps) {
  const [localCommunities, setLocalCommunities] = useState<Group[]>(communities)
  const [searchTerm, setSearchTerm] = useState('')
  const { t, i18n, ready } = useTranslation()

  useEffect(() => {
    return () => {
      debouncedResults.cancel()
    }
  })

  const handleSearchChange = e => {
    const val = e.target.value
    setSearchTerm(val)

    let listToDisplay = communities

    if (val) {
      listToDisplay = communities?.filter(c => {
        return c.name.toLowerCase().includes(val.toLowerCase())
      })
      setLocalCommunities(listToDisplay)
    } else {
      setLocalCommunities(communities)
    }
  }

  const debouncedResults = useMemo(() => {
    return debounce(handleSearchChange, 400)
  }, [communities])

  const [currentFilter, setCurrentFilter] = useState('Alphabetical')
  const applyFilter = filter => {
    let filteredCommunities = [...localCommunities]

    switch (filter) {
      case 'Alphabetical':
        if (currentFilter === 'Alphabetical') {
          setCurrentFilter('-Alphabetical')
          filteredCommunities.sort((a, b) => b.name.localeCompare(a.name))
        } else {
          setCurrentFilter('Alphabetical')
          filteredCommunities.sort((a, b) => a.name.localeCompare(b.name))
        }
        break
      case 'User Count':
        if (currentFilter === 'User Count') {
          setCurrentFilter('-User Count')
          filteredCommunities.sort((a, b) => b.userCount - a.userCount)
        } else {
          setCurrentFilter('User Count')
          filteredCommunities.sort((a, b) => a.userCount - b.userCount)
        }
        break

      case 'Age':
        if (currentFilter === 'Age') {
          setCurrentFilter('-Age')
          filteredCommunities.sort((a, b) => getGroupIdOrUserId(b) - getGroupIdOrUserId(a))
        } else {
          setCurrentFilter('Age')
          filteredCommunities.sort((a, b) => getGroupIdOrUserId(a) - getGroupIdOrUserId(b))
        }
        break
      default:
        break
    }

    setLocalCommunities(filteredCommunities)
  }

  return (
    <main className="xs:flex xs:flex-col xs:mx-0 xs:p-0 xs:text-center xs:align-center h-full w-full max-w-screen-xl space-y-12 sm:mx-auto  sm:p-24 md:px-0">
      <div className="flex flex-col items-center px-8 py-16 text-purple-500 dark:text-purple-500">
        <h1 className="mb-8 text-6xl font-bold">{t('pageTitle.communities')}</h1>
        <div className="mb-8 flex w-full flex-col justify-between md:max-w-lg md:flex-row">
          <div className="relative mb-4 w-full md:mb-0 md:mr-2">
            <MagnifyingGlassIcon className="absolute left-0 top-0 ml-3 mt-3 h-5 w-5 fill-current text-gray-500 dark:text-gray-400" />
            <input
              id="search"
              name="search"
              className="w-full rounded-lg bg-white py-2 pl-10 pr-4 shadow-md focus:outline-none dark:bg-gray-700 dark:text-white"
              onChange={debouncedResults}
              type="text"
              placeholder="Explore"
            />
          </div>
          <div className="flex space-x-2">
            <FilterButton
              filterKey="Alphabetical"
              iconTrue={BarsArrowDownIcon}
              iconFalse={BarsArrowUpIcon}
              applyFilter={applyFilter}
              currentFilter={currentFilter}
              filterClass={filterButtonClass}
              iconClass={iconClass}
            />
            <FilterButton
              filterKey="User Count"
              iconTrue={UserMinusIcon}
              iconFalse={UserGroupIcon}
              applyFilter={applyFilter}
              currentFilter={currentFilter}
              filterClass={filterButtonClass}
              iconClass={iconClass}
            />
            <FilterButton
              filterKey="Age"
              iconTrue={ClockIcon}
              iconFalse={MinusCircleIcon}
              applyFilter={applyFilter}
              currentFilter={currentFilter}
              filterClass={filterButtonClass}
              iconClass={iconClass}
            />
          </div>
        </div>
        {currentFilter}
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab className={({ selected }) => tabClass(selected)}>Logos</Tab>
          <Tab className={({ selected }) => tabClass(selected)}>Logos Discourse</Tab>
          <Tab className={({ selected }) => tabClass(selected)}>Another Discourse</Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <div className="row-gap-8 mb-8 grid grid-cols-1 justify-items-center   gap-4 sm:grid-cols-1 md:grid-cols-2 md:justify-items-center lg:grid-cols-3">
              {localCommunities.map((community, index) => (
                <CommunityCard key={community.groupId} community={community} index={index} />
              ))}
            </div>
            {localCommunities?.length === 0 && (
              <div className="my-12 flex flex-col items-center justify-center space-y-4">
                <motion.h2
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-semibold dark:text-gray-200"
                >
                  Oops, No Results Found
                </motion.h2>
                <motion.p
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="px-4 text-center text-lg dark:text-gray-300"
                >
                  <>
                    {' '}
                    {searchTerm
                      ? 'We could not find any communities that match your search. Try adjusting your filters or search again with a different term'
                      : 'We could not find any communities at this time. Please try again later'}
                    .
                  </>
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="rounded bg-purple-500 px-4 py-2 font-bold text-white shadow dark:bg-purple-700 dark:text-gray-200"
                >
                  Create a new community
                </motion.button>
              </div>
            )}
          </Tab.Panel>
          <Tab.Panel>
            <AllTopics />
          </Tab.Panel>
          <Tab.Panel>
            <>wip</>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </main>
  )
}

export default HomePage

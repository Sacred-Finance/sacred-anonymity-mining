import React, { useEffect, useMemo, useState } from 'react'
import { debounce } from 'lodash'
import { CommunityCard } from '../components/CommunityCard/CommunityCard'
import { getGroupIdOrUserId } from '../contexts/CommunityProvider'
import {
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  MinusCircleIcon,
  TrashIcon,
  UserGroupIcon,
  UserMinusIcon,
} from '@heroicons/react/20/solid'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { Group } from '@/types/contract/ForumInterface'
import { User } from '@/lib/model'
import AllTopics from '@components/Discourse/AllTopics'
import { Tab } from '@headlessui/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useRouter } from 'next/router'
import { PrimaryButton } from '@components/buttons'

interface HomeProps {
  isAdmin: boolean
  users: User[]
  communities: Group[]
}
const tabClass = selected =>
  clsx(
    'w-full rounded text-sm font-medium nowrap py-2 px-4 text-center focus:outline-none transition duration-150',
    selected
      ? 'bg-primary-500 text-white shadow-md hover:bg-primary-600 focus:ring-2 focus:ring-primary-400'
      : 'bg-gray-100 dark:bg-gray-800 text-primary-500 dark:text-gray-400 hover:bg-primary-500/25 dark:hover:bg-primary-700 hover:text-white',
    'focus:ring-offset-2'
  )

const FilterButton = ({
  filterKey,
  checkedIcon: CheckedIcon,
  unCheckedIcon: UnCheckedIcon,
  applyFilter,
  currentFilter,
}) => {
  return (
    <PrimaryButton
      onClick={() => applyFilter(filterKey)}
      className={'rounded p-2 text-white transition-colors duration-200 ease-in-out dark:bg-gray-900 '}
      loadingPosition="start"
      startIcon={
        currentFilter === `-${filterKey}` ? (
          <CheckedIcon className={'h-5 w-5 fill-inherit stroke-inherit text-gray-500 dark:fill-white'} />
        ) : (
          <UnCheckedIcon className={'h-5 w-5 fill-inherit stroke-inherit text-gray-500 dark:fill-white'} />
        )
      }
    />
  )
}

function NoCommunities(props: { groups: Group[]; searchTerm: string }) {
  const router = useRouter()
  return (
    <>
      {props.groups?.length === 0 && (
        <div className="col-span-full flex w-full flex-col items-center justify-center space-y-4">
          <motion.h2
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold dark:text-gray-200 "
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
              {props.searchTerm
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
            onClick={() => {
              // link to create community page /create
              router.push('/create-group')
            }}
          >
            Create a new community
          </motion.button>
        </div>
      )}
    </>
  )
}
function FilterButtons(props: { applyFilter: (filter: string) => void; currentFilter: string }) {
  const base = 'h-5 w-5 fill-white stroke-inherit text-white dark:fill-white'
  const active = 'ring-2 brightness-125 ring-primary-500 dark:ring-primary-500 bg-primary-500 dark:bg-primary-600'
  const commonClasses = 'rounded p-2 text-white transition-colors duration-200 ease-in-out dark:bg-gray-900'

  const filters = [
    {
      label: 'Alphabetical',
      icon: props.currentFilter === `-Alphabetical` ? BarsArrowDownIcon : BarsArrowUpIcon,
    },
    {
      label: 'User Count',
      icon: props.currentFilter === `-User Count` ? UserMinusIcon : UserGroupIcon,
    },
    {
      label: 'Age',
      icon: props.currentFilter === `-Age` ? ClockIcon : MinusCircleIcon,
    },
  ]

  return (
    <>
      {filters.map(filter => (
        <PrimaryButton
          key={filter.label}
          onClick={() => props.applyFilter(filter.label)}
          className={clsx(commonClasses, props.currentFilter.includes(filter.label) ? active : '')}
          loadingPosition="start"
          startIcon={<filter.icon className={clsx(base)} />}
        />
      ))}
    </>
  )
}

function HomePage({ isAdmin = false, users, communities }: HomeProps) {
  // state
  const [localCommunities, setLocalCommunities] = useState<Group[]>(communities)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentFilter, setCurrentFilter] = useState('Alphabetical')
  const [selectedIndex, setSelectedIndex] = useLocalStorage('communityTab', 0)
  const router = useRouter()

  useEffect(() => {
    return () => {
      debouncedResults.cancel()
    }
  })

  useEffect(() => {
    if (router.query?.tab) {
      if (typeof router.query.tab === 'string') {
        setSelectedIndex(parseInt(router.query.tab))
      }
    }
  }, [])

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
    <div className="flex w-full flex-col items-start border-b-2 border-primary-500 px-1 pb-8 pt-0 text-primary-500 dark:border-primary-600">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex} vertical={false}>
        <div className="grid grid-flow-dense gap-4 rounded-lg bg-white p-4 shadow-md dark:bg-gray-900 sm:justify-items-stretch">
          <div className="flex w-full flex-wrap items-center gap-10 sm:col-span-2 sm:justify-center md:col-span-2 md:justify-start">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-col gap-1">
                <small className="font-semibold text-gray-600 dark:text-gray-400">Search</small>
                <SearchBar debouncedResults={debouncedResults} />
              </div>
            </div>

            <div className="group relative flex flex-col gap-2">
              <small className="font-semibold text-gray-600 dark:text-gray-400">Filters</small>
              <div className="flex items-center justify-start gap-2">
                <FilterButtons applyFilter={applyFilter} currentFilter={currentFilter} />
              </div>
              <span className="absolute -bottom-4 left-0 hidden h-fit w-fit items-center gap-1 rounded border bg-gray-700 px-1 text-xs text-white group-hover:block dark:bg-gray-500">
                {currentFilter.replace('-', '')} <span>{currentFilter.includes('-') ? '▼' : '▲'}</span>
              </span>
            </div>

            <div className="group flex flex-col gap-2">
              <small className="font-semibold text-gray-600 dark:text-gray-400">Communities</small>
              <Tab.List className="flex min-w-fit flex-nowrap items-center space-x-2 rounded bg-gray-100 p-1 dark:bg-gray-800">
                <Tab className={({ selected }) => tabClass(selected)}>Logos</Tab>
                <Tab className={({ selected }) => tabClass(selected)}>Discourse</Tab>
              </Tab.List>
            </div>
          </div>

          <AnimatePresence mode={'sync'}>
            <Tab.Panels className="min-h-screen rounded-lg bg-white p-4 dark:bg-gray-900">
              <Tab.Panel key="panel1">
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                  className="flex flex-wrap gap-7 sm:justify-stretch"
                >
                  <NoCommunities groups={communities} searchTerm={searchTerm} />
                  {localCommunities.map(community => (
                    <CommunityCard key={community.groupId} community={community} />
                  ))}
                </motion.div>
              </Tab.Panel>

              <Tab.Panel key="panel2">
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                  className="flex flex-wrap gap-4 sm:justify-stretch"
                >
                  <AllTopics />
                </motion.div>
              </Tab.Panel>
            </Tab.Panels>
          </AnimatePresence>
        </div>
      </Tab.Group>
    </div>
  )
}

export const SearchBar = ({ debouncedResults }) => {
  return (
    <>
      <div className="flex min-w-[200px] items-center rounded border text-primary-600 hover:shadow-md  dark:bg-gray-800 ">
        <div className={'flex justify-center p-3'}>
          <MagnifyingGlassIcon className="h-6 w-6" />
        </div>
        <input
          id="search"
          name="search"
          className="col-span-6 flex h-full w-full rounded border-0  bg-transparent outline-0 focus:select-none focus:outline-none  focus:ring-0"
          onChange={debouncedResults}
          type="text"
          placeholder="Explore"
        />
        <button
          className={'flex justify-center p-3 hover:opacity-75'}
          onClick={() => {
            document.getElementById('search').value = ''
            debouncedResults({ target: { value: '' } })
          }}
        >
          <TrashIcon className=" h-6 w-6" />
        </button>
      </div>
    </>
  )
}

export default HomePage

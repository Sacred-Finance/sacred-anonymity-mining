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
import { router } from 'next/client'

interface HomeProps {
  isAdmin: boolean
  users: User[]
  communities: Group[]
}
const filterButtonClass = 'rounded p-2 text-white transition-colors duration-200 ease-in-out dark:bg-gray-900 '
const iconClass = 'h-5 w-5 fill-inherit stroke-inherit text-gray-500 dark:fill-white'
const tabClass = selected =>
  clsx(
    'w-full rounded text-sm font-medium nowrap py-2 px-4 text-center focus:outline-none peer group',
    'ring-white ring-offset-blue-400 focus:outline-none focus:ring-2',
    selected
      ? 'bg-primary-500 text-white shadow hover:bg-primary-500/90 '
      : 'text-primary-700 hover:text-white hover:bg-primary-500/25'
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

function NoCommunities(props: { groups: Group[]; searchTerm: string }) {
  const router = useRouter()
  return (
    <>
      {props.groups?.length === 0 && (
        <div className=" col-span-full w-full flex flex-col items-center justify-center space-y-4">
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

function FilterButtons(props: { applyFilter: (filter) => void; currentFilter: string }) {
  return (
    <>
      <FilterButton
        filterKey="Alphabetical"
        iconTrue={BarsArrowDownIcon}
        iconFalse={BarsArrowUpIcon}
        applyFilter={props.applyFilter}
        currentFilter={props.currentFilter}
        filterClass={filterButtonClass}
        iconClass={iconClass}
      />
      <FilterButton
        filterKey="User Count"
        iconTrue={UserMinusIcon}
        iconFalse={UserGroupIcon}
        applyFilter={props.applyFilter}
        currentFilter={props.currentFilter}
        filterClass={filterButtonClass}
        iconClass={iconClass}
      />
      <FilterButton
        filterKey="Age"
        iconTrue={ClockIcon}
        iconFalse={MinusCircleIcon}
        applyFilter={props.applyFilter}
        currentFilter={props.currentFilter}
        filterClass={filterButtonClass}
        iconClass={iconClass}
      />
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

  // hooks
  const { t, i18n, ready } = useTranslation()

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
    <div className={'flex w-full flex-col items-start pb-8 ps-1 pt-0'}>
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex} vertical={false}>
        <div className="grid grid-flow-dense gap-4 rounded sm:justify-items-stretch">
          <div
            className={
              'flex w-full flex-wrap items-center gap-10 sm:col-span-2 sm:justify-center md:col-span-2 md:justify-start'
            }
          >
            <div className={'flex flex-wrap items-center gap-2'}>
              <div className={'flex flex-col  text-primary-800'}>
                <small className={'text-sm'}>Search</small>

                <SearchBar debouncedResults={debouncedResults} />
              </div>
            </div>

            <div className={'group  flex flex-col text-primary-800'}>
              <small className={'flex justify-between text-sm'}>Filters</small>
              <div className={'flex items-center justify-start'}>
                <FilterButtons applyFilter={applyFilter} currentFilter={currentFilter} />
              </div>
              <span
                className={
                  'absolute -bottom-4 hidden h-fit w-fit items-center gap-1 rounded border bg-gray-900 px-1 text-xss text-white group-hover:block'
                }
              >
                {currentFilter.replace('-', '')}{' '}
                <span className={'text-primary-500'}>{currentFilter.includes('-') ? '▼' : '▲'}</span>
              </span>
            </div>

            <div className={'flex flex-col text-primary-800'}>
              <small className={'text-sm'}>Communities</small>

              <Tab.List className={'flex min-w-fit flex-nowrap items-center rounded'}>
                <Tab className={({ selected }) => tabClass(selected)}>Logos</Tab>
                <Tab className={({ selected }) => tabClass(selected)}>Discourse</Tab>
              </Tab.List>
            </div>
          </div>

          <AnimatePresence mode={'sync'}>
            <Tab.Panels className={'min-h-screen'}>
              <Tab.Panel key="panel1">

                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  // variants={panelVariants}
                  transition={{ duration: 0.5 }}
                  className="flex flex-wrap gap-4 sm:justify-stretch "
                >
                  <NoCommunities groups={communities} searchTerm={searchTerm} />

                  {localCommunities.map((community, index) => (
                    <CommunityCard key={community.groupId} community={community} />
                  ))}
                  {/*<NoCommunities groups={localCommunities} searchTerm={searchTerm} />*/}
                </motion.div>
              </Tab.Panel>

              <Tab.Panel key="panel2">
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  // variants={panelVariants}
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

export const Flex1 = ({ children }) => <div className="flex-1">{children}</div>

export const SearchBar = ({ debouncedResults }) => {
  return (
    <>
      <div className="flex min-w-[200px] items-center rounded border text-primary-600 hover:shadow-md">
        <div className={'flex justify-center p-3'}>
          <MagnifyingGlassIcon className="h-6 w-6" />
        </div>
        <input
          id="search"
          name="search"
          className="col-span-6 flex h-full w-full rounded border-0 shadow-none outline-0 focus:select-none focus:outline-none focus:ring-0 dark:text-white"
          onChange={debouncedResults}
          type="text"
          placeholder="Explore"
        />
        <button className={'flex justify-center p-3 hover:text-primary-600/50'}>
          <TrashIcon
            className=" h-6 w-6"
            onClick={() => {
              document.getElementById('search').value = ''
              debouncedResults({ target: { value: '' } })
            }}
          />
        </button>
      </div>
    </>
  )
}

export default HomePage

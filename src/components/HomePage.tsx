import React, { useEffect, useMemo, useState } from 'react'
import { Identity } from '@semaphore-protocol/identity'
import { Community } from '../lib/model'
import { useAccount } from 'wagmi'
import { debounce } from 'lodash'
import { CommunityCard } from '../components/CommunityCard/CommunityCard'
import { useLoaderContext } from '../contexts/LoaderContext'
import { useTranslation } from 'next-i18next'
import { getGroupIdOrUserId, useCommunityContext } from '../contexts/CommunityProvider'
import {
  ArrowDownIcon,
  ArrowUpIcon, BarsArrowDownIcon, BarsArrowUpIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  MinusCircleIcon,
  TrashIcon,
  UserGroupIcon,
  UserMinusIcon,
} from '@heroicons/react/20/solid'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface HomeProps {
  createCommunity: Function
  isAdmin: boolean
}

function HomePage({ createCommunity, isAdmin = false }: HomeProps) {
  const { dispatch, state } = useCommunityContext()
  const { users, communities } = state
  const { isLoading, setIsLoading } = useLoaderContext()
  /** groupMap is only to store the groupName as key and whether the connected user has already joined it or not */
  const [groupMap, setGroupMap] = useState<any>({})

  const [searchTerm, setSearchTerm] = useState('')

  const [localCommunities, setLocalCommunities] = useState<Community[]>([])

  const { address } = useAccount()
  const { t, i18n, ready } = useTranslation()
  /** To prepare a map of the group already joined by the user connected */
  useEffect(() => {
    if (communities?.length) {
      const gMap = {}
      // Filter out duplicate communities based on their groupId and name
      const uniqueCommunities = Array.from(
        new Set(communities.map(c => JSON.stringify({ groupId: c.groupId, name: c.name })))
      )
        .map(communityKey =>
          communities.find(c => JSON.stringify({ groupId: c.groupId, name: c.name }) === communityKey)
        )
        .filter(c => c) as Community[]

      uniqueCommunities.forEach(c => {
        if (!c?.id) return
        gMap[c.id?.toString()] = users.find(u => {
          const generatedIdentity = new Identity(`${address}_${c.groupId}_${u.name}`)
          const userCommitment = generatedIdentity.getCommitment().toString()
          return +u?.groupId === +c.groupId && u?.identityCommitment === userCommitment
        })
      })
      setGroupMap(gMap)
      // Update the localCommunities state with uniqueCommunities
      if (!searchTerm) {
        if (uniqueCommunities && uniqueCommunities.length) setLocalCommunities(uniqueCommunities)
      }
    }
  }, [users, communities])

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

  const filterButtonClass =
    'rounded-md p-2 text-white transition-colors duration-200 ease-in-out dark:bg-gray-900 '
  const iconClass =
      "h-5 w-5 fill-inherit stroke-inherit text-gray-500 dark:fill-white"

  const FilterButton = ({ filterKey, iconTrue, iconFalse, applyFilter, currentFilter, filterClass, iconClass }) => {
    const IconTrue = iconTrue;
    const IconFalse = iconFalse;

    return (
        <button
            onClick={() => applyFilter(filterKey)}
            className={clsx(filterClass, currentFilter.includes(filterKey) && '!bg-primary-bg !fill-white')}
        >
          {currentFilter === `-${filterKey}` ? <IconTrue className={iconClass} /> : <IconFalse className={iconClass} />}
        </button>
    );
  };

  return (
    <main className="mx-auto h-full w-full max-w-screen-xl space-y-12  p-24 md:px-0">
      <div className="flex flex-col items-center py-16 text-purple-500 dark:text-purple-500">
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
                filterKey='Alphabetical'
                iconTrue={BarsArrowDownIcon}
                iconFalse={BarsArrowUpIcon}
                applyFilter={applyFilter}
                currentFilter={currentFilter}
                filterClass={filterButtonClass}
                iconClass={iconClass}
            />
            <FilterButton
                filterKey='User Count'
                iconTrue={UserMinusIcon}
                iconFalse={UserGroupIcon}
                applyFilter={applyFilter}
                currentFilter={currentFilter}
                filterClass={filterButtonClass}
                iconClass={iconClass}
            />
            <FilterButton
                filterKey='Age'
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

      <div className="row-gap-8 mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {localCommunities.map((community, index) => (
          <CommunityCard key={index} community={community} index={index} isAdmin={isAdmin} />
        ))}
      </div>

      {localCommunities?.length === 0 && (
        <div className="my-12 flex flex-col items-center justify-center space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold dark:text-gray-200"
          >
            Oops, No Results Found
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
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
            onClick={() => createCommunity()}
          >
            Create a new community
          </motion.button>
        </div>
      )}

      {communities?.length === 0 && !isLoading && (
        <div className="my-12 flex flex-col items-center justify-center">
          <p className="mb-4 text-xl dark:text-gray-200">0 Communities :(</p>
          <button
            className="rounded bg-purple-500 px-4 py-2 font-bold text-white shadow dark:bg-purple-700 dark:text-gray-200"
            onClick={() => createCommunity()}
          >
            Create
          </button>
        </div>
      )}
    </main>
  )
}

export default HomePage

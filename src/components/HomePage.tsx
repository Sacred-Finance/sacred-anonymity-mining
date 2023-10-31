import React, { useEffect, useMemo, useState } from 'react'
import { debounce } from 'lodash'
import { CommunityCard } from '../components/CommunityCard/CommunityCard'
import { useCommunityContext } from '../contexts/CommunityProvider'
import { MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/20/solid'
import { motion } from 'framer-motion'
import { Group } from '@/types/contract/ForumInterface'
import { DiscourseCommunity } from '@/lib/model'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import Communities from './Discourse/Communities'
import { useRouter } from 'next/router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shad/ui/tabs'
import { Button } from '@/shad/ui/button'
import { IoAddCircle } from 'react-icons/io5'
import { Separator } from '@/shad/ui/separator'
import { ScrollArea, ScrollBar } from '@/shad/ui/scroll-area'

interface HomeProps {
  isAdmin: boolean
  discourseCommunities: DiscourseCommunity[]
}

function NoCommunities(props: { searchTerm: string }) {
  if (!props.searchTerm) {
    return (
      <>
        <div className="col-span-full flex w-full flex-col items-center justify-center space-y-4">
          <motion.h2
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="animate-pulse text-3xl font-semibold  dark:text-gray-200"
          >
            Loading
          </motion.h2>
        </div>
      </>
    )
  }

  const router = useRouter()
  return (
    <>
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
    </>
  )
}

function HomePage({ isAdmin = false, discourseCommunities }: HomeProps) {
  const { state } = useCommunityContext()
  const { communities, users } = state

  // state
  const [filteredCommunities, setFilteredCommunities] = useState<Group[]>(communities)
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
      setFilteredCommunities(listToDisplay)
    } else {
      setFilteredCommunities(communities)
    }
  }

  const debouncedResults = useMemo(() => {
    return debounce(handleSearchChange, communities.length ? 400 : 0)
  }, [communities])

  if (!communities.length) {
    return <NoCommunities searchTerm={searchTerm} />
  }
  return (
    <>
      <Tabs defaultValue="logos" className="h-full space-y-6">
        <div className="space-between flex flex-wrap items-center gap-2">
          <TabsList>
            <TabsTrigger value="logos" className="relative">
              Logos
            </TabsTrigger>
            <TabsTrigger value="discourse">Discourse</TabsTrigger>
          </TabsList>
          <div className="ml-auto mr-4 flex w-full max-w-xl items-center">
            <SearchBar debouncedResults={debouncedResults} />
          </div>
          <div className="ml-auto mr-4">
            <Button
              variant={'default'}
              onClick={() => {
                router.push('/create-group')
              }}
            >
              <IoAddCircle className="mr-2 h-4 w-4" />
              Create Community
            </Button>
          </div>
        </div>
        <TabsContent value="logos" className="border-none p-0 outline-none">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Communities</h2>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="relative">
            <ScrollArea className={'h-full'}>
              <div className="grid-cols-1 items-start justify-center gap-6 rounded-lg p-0 md:grid md:p-8 lg:grid-cols-2 xl:grid-cols-3">
                {(filteredCommunities.length ? filteredCommunities : communities)
                  .map(community => (
                    <div key={community.groupId} className="col-span-2 grid items-start gap-6 lg:col-span-1">
                      <CommunityCard community={community} isAdmin={isAdmin || false} />
                    </div>
                  ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </TabsContent>
        <TabsContent value="discourse" className="h-full flex-col border-none p-0 data-[state=active]:flex">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Discourse</h2>
              <p className="text-sm text-muted-foreground">Your favorite communities. From Discourse.</p>
            </div>
          </div>
          <Separator className="my-4" />
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="xs:justify-center flex flex-wrap gap-4 md:justify-start "
          >
            <Communities communities={discourseCommunities} />
          </motion.div>
        </TabsContent>
      </Tabs>
    </>
  )
}

export const SearchBar = ({ debouncedResults }) => {
  return (
    <>
      <div className="form-input flex h-10 w-full items-center  rounded hover:shadow-md  dark:bg-gray-900 dark:text-white">
        <div className={'flex justify-center p-3'}>
          <MagnifyingGlassIcon className="h-4 w-6 text-black dark:text-inherit" />
        </div>
        <input
          id="search"
          name="search"
          className="col-span-6 flex h-full w-full rounded border-0  bg-transparent text-black outline-0 focus:select-none focus:outline-none focus:ring-0 dark:text-inherit"
          onChange={debouncedResults}
          type="text"
          placeholder="Explore"
        />
        <button
          className={'flex justify-center p-3 text-black hover:opacity-75 dark:text-inherit'}
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

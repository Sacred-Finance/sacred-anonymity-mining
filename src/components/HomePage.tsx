import React, { useEffect, useMemo, useState } from 'react'
import { debounce } from 'lodash'
import { CommunityCard } from '../components/CommunityCard/CommunityCard'
import { useCommunityContext } from '../contexts/CommunityProvider'
import { motion } from 'framer-motion'
import { Group } from '@/types/contract/ForumInterface'
import { DiscourseCommunity } from '@/lib/model'
import Communities from './Discourse/Communities'
import { useRouter } from 'next/router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shad/ui/tabs'
import { Button } from '@/shad/ui/button'
import { IoAddCircle } from 'react-icons/io5'
import { Separator } from '@/shad/ui/separator'
import { ScrollArea, ScrollBar } from '@/shad/ui/scroll-area'
import LoadingComponent from '@components/LoadingComponent'
import { SearchBar } from '@components/SearchBar'

interface HomeProps {
  isAdmin: boolean
  isLoading: boolean
  discourseCommunities: DiscourseCommunity[]
}

function NoCommunities({ searchTerm }: { searchTerm: string }) {
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
          onClick={() => {
            router.push('/create-group')
          }}
        >
          Create a new community
        </motion.button>
      </div>
    </>
  )
}

function HomePage({ isLoading = false, isAdmin = false, discourseCommunities }: HomeProps) {
  const { state } = useCommunityContext()
  const { communities } = state

  // state
  const [filteredCommunities, setFilteredCommunities] = useState<Group[]>(communities)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

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
      setFilteredCommunities(listToDisplay)
    } else {
      setFilteredCommunities(communities)
    }
  }

  const debouncedResults = useMemo(() => {
    return debounce(handleSearchChange, communities.length ? 400 : 0)
  }, [communities])

  // todo: find a standard for page loading.

  if (isLoading) {
    return <LoadingComponent />
  }

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
            <SearchBar debouncedResults={debouncedResults} searchTerm={searchTerm} />
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
              <div className="grid-cols-auto flex grow flex-col  gap-6 rounded-lg p-0 md:grid  md:py-8 lg:grid-cols-2 xl:grid-cols-3">
                {(filteredCommunities.length ? filteredCommunities : communities).map(community => (
                  <CommunityCard key={`$community_${community.id}`} community={community} isAdmin={isAdmin || false} />
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

export default HomePage

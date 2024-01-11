import React, { useEffect, useMemo, useState } from 'react'
import { debounce } from 'lodash'
import { CommunityCard } from '@components/CommunityCard/CommunityCard'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { motion } from 'framer-motion'
import type { Group } from '@/types/contract/ForumInterface'
import Communities from './Discourse/Communities'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shad/ui/tabs'
import { Button } from '@/shad/ui/button'
import { IoAddCircle } from 'react-icons/io5'
import { Separator } from '@/shad/ui/separator'
import { ScrollArea, ScrollBar } from '@/shad/ui/scroll-area'
import LoadingComponent from '@components/LoadingComponent'
import { SearchBar } from '@components/SearchBar'
import Link from 'next/link'

interface HomeProps {
  isAdmin: boolean
  isLoading: boolean
  isValidating: boolean
}

function NoCommunities({ searchTerm }: { searchTerm: string }) {
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
        <Link href="/create-group">
          <Button variant="default">
            <IoAddCircle className="h-6 w-6" />
            New Community
          </Button>
        </Link>
      </div>
    </>
  )
}

function HomePage({ isLoading = false, isAdmin = false, isValidating = false }: HomeProps) {
  const { state } = useCommunityContext()
  const { communities } = state

  // state
  const [filteredCommunities, setFilteredCommunities] = useState<Group[]>(communities)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    return () => {
      debouncedResults.cancel()
    }
  })

  const handleSearchChange = (e: { target: { value: string } }) => {
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

  if (!communities.length && !isValidating) {
    return <NoCommunities searchTerm={searchTerm} />
  }
  return (
    <>
      <Tabs defaultValue="logos" className="h-full space-y-6">
        <TabsContent value="logos" className="border-none p-0 outline-none">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h2 className="text-4xl font-semibold tracking-tight">Logos Communities</h2>
              <p className="pl-1 text-sm text-muted-foreground">Create your own community or join an existing one.</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="discourse" className="h-full flex-col border-none p-0 data-[state=active]:flex">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h2 className="text-4xl font-semibold tracking-tight">Discourse</h2>
              <p className="pl-1 text-sm text-muted-foreground">Your favorite communities. From Discourse.</p>
            </div>
          </div>
        </TabsContent>
        <div className="flex w-full flex-wrap items-center justify-center gap-2 md:flex-nowrap md:justify-between">
          <div className="flex w-full basis-1/4 items-center justify-between">
            <TabsList>
              <TabsTrigger value="logos" className="relative">
                Logos
              </TabsTrigger>
              <TabsTrigger value="discourse">Discourse</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex w-full min-w-fit  basis-3/4 items-center justify-center  gap-2">
            <SearchBar debouncedResults={debouncedResults} searchTerm={searchTerm} />
          </div>
          <div className="flex basis-1/4 items-center justify-end">
            <Link href="/create-group">
              <Button variant="default">
                <IoAddCircle className="h-6 w-6" />
                New Community
              </Button>
            </Link>
          </div>
        </div>
        <TabsContent value="logos" className="border-none p-0 outline-none">
          <Separator className="my-4" />
          <div className="relative">
            <ScrollArea className="h-full">
              <div className="grid-cols-auto flex grow flex-col  gap-6 rounded-lg p-0 md:grid  md:py-8 lg:grid-cols-2 xl:grid-cols-3">
                {(searchTerm ? filteredCommunities : communities).map(community => (
                  <CommunityCard key={`$community_${community.id}`} community={community} isAdmin={isAdmin || false} />
                ))}
                {!filteredCommunities.length && searchTerm && <NoCommunities searchTerm={searchTerm} />}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </TabsContent>
        <TabsContent value="discourse" className="h-full flex-col border-none p-0 data-[state=active]:flex">
          <Separator className="my-4" />
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="xs:justify-center flex flex-wrap gap-4 md:justify-start "
          >
            <Communities />
          </motion.div>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default HomePage

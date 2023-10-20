import React from 'react'
import _ from 'lodash'
import Link from 'next/link'
import clsx from 'clsx'
import { HomeIcon } from '@heroicons/react/20/solid'
import ToolTip from '@components/HOC/ToolTip'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { useRouter } from 'next/router'
import { buttonVariants } from '@/shad/ui/button'
import { cn } from '@/shad/lib/utils'

export function SideItem({
  title,
  href,
  external = false,
  icon,
  isOpen,
  onClick,
}: {
  title: string
  href?: string | undefined
  external?: boolean
  icon: React.ReactNode
  isOpen: boolean
  onClick?: () => void | undefined
}) {
  const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  const active = useRouter().pathname === href

  return (
    <div className={clsx('group sticky top-0 w-full rounded bg-white dark:bg-gray-900')}>
      <ToolTip tooltip={title}>
        <Link
          href={(!onClick && href) || '/'}
          {...linkProps}
          className={clsx(
            'flex w-full items-center rounded shadow group-hover:bg-gray-200 dark:group-hover:bg-gray-800 md:p-3',
            isOpen ? 'gap-3' : 'flex-col gap-1',
            active && ' brightness-125'
          )}
          onClick={onClick}
        >
          <span className={clsx('h-6 w-6 rounded')}>{icon}</span>

          <span className={clsx('flex items-center text-sm ', isOpen ? 'text-sm' : 'hidden ')}>
            {_.startCase(title)}
          </span>
        </Link>
      </ToolTip>
    </div>
  )
}
//
// export default function Sidebar({ isOpen, setIsOpen }) {
//   const router = useRouter()
//   const { groupId } = router.query
//   const user = useUserIfJoined(groupId as string) as User
//
//   return (
//     <div className={'relative mr-1'}>
//       <motion.aside
//         initial={{ x: -100 }}
//         animate={isOpen ? { x: 0 } : { x: 0 }}
//         exit={{ x: -100 }}
//         className={'sticky top-0 z-10 flex h-auto w-full flex-col dark:bg-gray-800 '}
//       >
//         <div className="flex w-full flex-col items-center">
//           <ul className=" flex flex-col items-center gap-2 py-4 text-primary-600 ">
//             <button onClick={() => setIsOpen(!isOpen)} className={clsx('flex w-full items-center justify-center')}>
//               <ToolTip tooltip={isOpen ? 'Collapse' : 'Expand'}>
//                 {!isOpen ? (
//                   <ChevronDoubleRightIcon className={'h-8 w-8'} />
//                 ) : (
//                   <ChevronDoubleLeftIcon className={'h-8 w-8'} />
//                 )}
//               </ToolTip>
//             </button>
//
//             <SideItem title={'home'} href={'/'} isOpen={isOpen} icon={<HomeIcon />} />
//             <SideItem title={'New Community'} href={'/create-group'} isOpen={isOpen} icon={<PlusCircleIcon />} />
//             <Avatar user={user?.identityCommitment?.toString()} />
//           </ul>
//         </div>
//       </motion.aside>
//     </div>
//   )
// }

export default function Sidebar({ className }) {
  const { state } = useCommunityContext()
  const { communities: logosCommunities } = state
  const router = useRouter()
  const { groupId } = router.query

  return (
    <div className={cn('pb-12 ', className)}>
      <div className="sticky top-0 space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Discover</h2>
          <div className="space-y-1">
            <Link
              href={`/`}
              className={cn(
                buttonVariants({ variant: router.pathname === '/' ? 'default' : 'ghost', size: 'default' }),
                'w-full justify-start gap-2'
              )}
            >
              <HomeIcon className={'h-5 w-5'} />
              Home
            </Link>
          </div>
        </div>
        {/*<div className="px-3 py-2">*/}
        {/*  <h2 className="text-md mb-2 px-4 font-semibold tracking-tight">Filter Tags</h2>*/}
        {/*  <div className="space-y-1">*/}
        {/*    {tags.map(tag => (*/}
        {/*      <div className="flex items-center space-x-2">*/}
        {/*        <Checkbox id={tag} />*/}
        {/*        <label*/}
        {/*          htmlFor={tag}*/}
        {/*          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"*/}
        {/*        >*/}
        {/*          {tag}*/}
        {/*        </label>*/}
        {/*      </div>*/}
        {/*    ))}*/}
        {/*  </div>*/}
        {/*</div>*/}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Logos</h2>
          <div className="space-y-1">
            {logosCommunities.map(community => {
              const active = groupId === community.groupId

              return (
                <Link
                  key={community?.groupId}
                  href={`/communities/${community?.groupId}`}
                  className={cn(
                    buttonVariants({ variant: active ? 'default' : 'ghost', size: 'default' }),
                    'w-full justify-start'
                  )}
                >
                  {community.name}
                </Link>
              )
            })}
          </div>
        </div>{' '}
        {/*<div className="px-3 py-2">*/}
        {/*  <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Logos</h2>*/}
        {/*  <div className="space-y-1">*/}
        {/*    {discourse.map(community => (*/}
        {/*      <Button variant="ghost" className="w-full justify-start">*/}
        {/*        {community}*/}
        {/*      </Button>*/}
        {/*    ))}*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
    </div>
  )
}

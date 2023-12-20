import React, { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import { Bars3Icon } from '@heroicons/react/20/solid'
import { Button } from '@/shad/ui/button'
import { XIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shad/ui/popover'

export interface ActionItem {
  icon: ReactNode
  label: ReactNode // This can be an SVG or any other visual React component
  onClick: () => void
}

export interface SpeedDialProps {
  actions: (ActionItem | ReactNode | false)[]
  onHover?: (e) => React.MouseEvent<HTMLButtonElement, MouseEvent>
  onOpen?: () => void
}

const MotionButton = motion(Button)

export const SpeedDial: React.FC<SpeedDialProps> = ({ actions, onHover, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false)

  actions = actions.filter(Boolean) as ActionItem[]

  if (!actions.length) return null
  return (
    <Popover>
      <PopoverTrigger asChild>
        <MotionButton
          variant={'link'}
          onClick={e => {
            setIsOpen(!isOpen)
            onOpen && onOpen()
            // ensure that the event is not propagated to the parent
            e.stopPropagation()
          }}
        >
          {isOpen ? (
            <XIcon className={'h-6 w-6 text-gray-700 dark:text-gray-300 dark:group-hover:text-white'} />
          ) : (
            <Bars3Icon className={'h-6 w-6 text-gray-700 dark:text-gray-300 dark:group-hover:text-white'} />
          )}
          <span className="sr-only">Open actions menu</span>
        </MotionButton>
      </PopoverTrigger>
      <PopoverContent className={'max-w-[200px] shadow-2xl'}>
        <div className="space-x-2 space-y-4 ">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Actions</h4>
          </div>
          <div className="space-y-2">
            {actions.map(action => {
              if (typeof action === 'object' && action.icon && action.label && action.onClick) {
                return (
                  <Button
                    key={action.label}
                    variant="secondary"
                    onClick={action.onClick}
                    className={'flex w-full items-center gap-2'}
                  >
                    {action.label}
                    {action.icon}
                  </Button>
                )
              } else if (action) {
                return <div className="flex w-full justify-center">{action}</div>
              } else {
                return null
              }
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

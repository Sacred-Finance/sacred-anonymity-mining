import type { ReactNode, MouseEvent } from 'react'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bars3Icon } from '@heroicons/react/20/solid'
import { Button } from '@/shad/ui/button'
import { XIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shad/ui/popover'

export interface ActionItem {
  icon: ReactNode
  label: ReactNode
  onClick: () => void
}

export interface CardDropDownProps {
  actions: Array<ActionItem | ReactNode | false>
  onOpen?: () => void
}

const MotionButton = motion(Button)

export const CardDropDown: React.FC<CardDropDownProps> = ({
  actions,
  onOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const filteredActions = actions.filter(Boolean) as ActionItem[]

  if (!filteredActions.length) {
    return null
  }

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    setIsOpen(!isOpen)
    onOpen?.()
    e.stopPropagation()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <MotionButton variant="link" onClick={handleButtonClick}>
          {isOpen ? (
            <XIcon className="h-6 w-6 text-gray-700 dark:text-gray-300 dark:group-hover:text-white" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300 dark:group-hover:text-white" />
          )}
          <span className="sr-only">Open actions menu</span>
        </MotionButton>
      </PopoverTrigger>
      <PopoverContent className="max-w-[200px] shadow-2xl">
        <div className="space-x-2 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Actions</h4>
            <ActionButtons actions={filteredActions} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface ActionButtonProps {
  action: ActionItem
}

const ActionButton: React.FC<ActionButtonProps> = ({ action }) => {
  if (typeof action === 'object' && 'onClick' in action) {
    return (
      <Button
        variant="secondary"
        onClick={action.onClick}
        className="flex w-full items-center gap-2"
      >
        {action.label}
        {action.icon}
      </Button>
    )
  }

  return <div className="flex w-full justify-center">{action}</div>
}

interface ActionButtonsProps {
  actions: ActionItem[]
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ actions }) => (
  <div className="space-y-2">
    {actions.map((action, index) => (
      <ActionButton key={index} action={action} />
    ))}
  </div>
)

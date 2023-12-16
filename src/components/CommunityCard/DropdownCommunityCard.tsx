import type { MouseEvent, ReactNode } from 'react'
import React, { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/20/solid'
import { Popover, PopoverContent, PopoverTrigger } from '@/shad/ui/popover'
import { Button } from '@/shad/ui/button'
import Link from 'next/link'

interface CardDropDownProps {
  actions: Array<ActionItem | false | ReactNode>
  onOpen?: () => void
}

export const DropdownCommunityCard: React.FC<CardDropDownProps> = ({
  actions,
  onOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const filteredActions = actions.filter(Boolean) as ActionItem[]

  if (!filteredActions.length) return null

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    setIsOpen(!isOpen)
    onOpen?.()
    e.stopPropagation()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button onClick={handleButtonClick} variant="ghost">
          {isOpen ? (
            <XMarkIcon className="h-6 w-6 text-white" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-white" />
          )}
          <span className="sr-only">Open actions menu</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full"
        onBlur={() => {
          setIsOpen(false)
        }}
      >
        <ActionButtons actions={filteredActions} />
      </PopoverContent>
    </Popover>
  )
}

export interface ActionItem {
  icon: ReactNode
  label: ReactNode
  onClick?: () => void
  href?: string
}

interface ActionButtonProps {
  action: ActionItem
}

const className =
  'text-white hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-4'
const ActionButton: React.FC<ActionButtonProps> = ({ action }) => {
  if ('onClick' in action) {
    return (
      <Button onClick={action.onClick} className={className}>
        {action.label}
        {action.icon}
      </Button>
    )
  } else if ('href' in action) {
    return (
      <Link href={action.href as string} className={className}>
        {action.label}
        {action.icon}
      </Link>
    )
  }
  return null
}

interface ActionButtonsProps {
  actions: ActionItem[]
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ actions }) => (
  <div className="flex flex-col gap-2">
    {actions.map((action, index) => (
      <ActionButton key={index} action={action} />
    ))}
  </div>
)

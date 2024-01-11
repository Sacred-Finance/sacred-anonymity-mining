import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shad/ui/hover-card'
import _ from 'lodash'
import { AiFillWarning } from 'react-icons/ai'
import React from 'react'

export function CantChangeLabel({ label }: { label: string }) {
  return (
    <HoverCard>
      <HoverCardTrigger className="flex items-center gap-2">
        {_.startCase(label)}
        <AiFillWarning size={20} />
      </HoverCardTrigger>
      <HoverCardContent className=" text-sm">{_.startCase(label)} cannot be changed after creation.</HoverCardContent>
    </HoverCard>
  )
}

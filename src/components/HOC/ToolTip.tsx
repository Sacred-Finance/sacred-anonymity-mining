import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shad/ui/tooltip'
import { Button, ButtonProps } from '@/shad/ui/button'
import {PrimaryButton} from "@components/buttons";

export default function ToolTip({
  tooltip,
  children,
  buttonProps,
}: {
  tooltip: string
  children: React.ReactNode
  buttonProps?: ButtonProps
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" {...buttonProps}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

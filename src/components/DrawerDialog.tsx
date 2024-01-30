import React from 'react'
import { useMediaQuery } from 'react-responsive'
import { Dialog, DialogContent, DialogTrigger } from '@/shad/ui/dialog'
import { Button, buttonVariants } from '@/shad/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@/shad/ui/drawer'
import { ScrollArea } from '@/shad/ui/scroll-area'

export function DrawerDialog({
  children,
  label,
  open,
  setOpen,
}: {
  children: React.ReactNode
  label: string | React.ReactNode
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)' })

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className={buttonVariants({ variant: 'secondary', size: 'default' })}>{label}</DialogTrigger>
        <DialogContent className="mx-4 h-full max-h-[80dvh] max-w-screen-lg overflow-y-auto">{children}</DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          {label} <span className="sr-only">drawer</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="mx-4 h-full max-w-screen-lg grow gap-2">
        <ScrollArea className="h-full max-h-[90dvh] grow border-b pb-2 ">{children}</ScrollArea>
        <DrawerClose className="mx-2 mb-2 mt-auto justify-self-end rounded bg-secondary py-2 ">Close</DrawerClose>
      </DrawerContent>
    </Drawer>
  )
}

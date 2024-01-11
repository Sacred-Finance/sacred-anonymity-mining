import React from 'react'
import { useMediaQuery } from 'react-responsive'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/shad/ui/dialog'
import { Button, buttonVariants } from '@/shad/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@/shad/ui/drawer'
import { ScrollArea } from '@/shad/ui/scroll-area'

export function DrawerDialog({ children, label }: { children: React.ReactNode; label: string | React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)' })

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
          <Button variant="outline">{label}</Button>
        </DialogTrigger>
        <DialogContent>
          {children}
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogContent>
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
      <DrawerContent className="mx-2 h-fit overflow-x-visible p-4">
        <ScrollArea className="h-full  overflow-x-visible ">{children}</ScrollArea>
        <DrawerClose asChild className="mt-4">
          <Button variant="outline">Close</Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  )
}

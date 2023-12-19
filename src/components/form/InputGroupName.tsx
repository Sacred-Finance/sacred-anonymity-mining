import React from 'react'
import { Input } from '@/shad/ui/input'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shad/ui/form'
import type { UseFormReturn } from 'react-hook-form'

export function InputGroupName({
  form,
}: {
  form: UseFormReturn<
    {
      groupName: string
      description: string
      tags?: string[] | undefined
      bannerFile?: { type: string; size: number } | undefined
      logoFile?: { type: string; size: number } | undefined
    },
    undefined
  >
}) {
  return (
    <FormField
      control={form.control}
      name="groupName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Group Name</FormLabel>
          <FormControl>
            <Input placeholder="Group Name" {...field} />
          </FormControl>
          <FormDescription>This is your group name</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

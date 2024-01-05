import React from 'react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shad/ui/form'
import type { UseFormReturn } from 'react-hook-form'
import { Textarea } from '@/shad/ui/textarea'

export function InputGroupDescription({
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
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg">Group Description</FormLabel>
          <FormControl>
            <Textarea placeholder="Group Description" {...field} />
          </FormControl>
          {/*<FormDescription>This is your group Description</FormDescription>*/}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

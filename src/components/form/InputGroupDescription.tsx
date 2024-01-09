import React from 'react'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shad/ui/form'
import { Textarea } from '@/shad/ui/textarea'
import type { FormReturnType } from '@components/form/form.schema'

export function InputGroupDescription({ form }: { form: FormReturnType }) {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg">Group Description</FormLabel>
          <FormDescription>This is your group Description</FormDescription>

          <FormControl>
            <Textarea placeholder="Group Description" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

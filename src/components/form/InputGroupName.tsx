import React from 'react'
import { Input } from '@/shad/ui/input'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shad/ui/form'
import type { FieldValues } from 'react-hook-form'
import type { FormReturnType } from '@components/form/form.schema'

export function InputGroupName({
  form,
  ...props
}: {
  form: FormReturnType
} & FieldValues) {
  return (
    <FormField
      {...props}
      control={form.control}
      name="groupName"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg">Group Name</FormLabel>
          <FormDescription>This is your group name</FormDescription>

          <FormControl>
            <Input placeholder="Group Name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

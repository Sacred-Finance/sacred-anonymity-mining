import React from 'react'
import { Input } from '@/shad/ui/input'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shad/ui/form'
import type { FieldValues } from 'react-hook-form'
import type { FormReturnType } from '@components/form/form.schema'
import { CantChangeLabel } from '@components/form/CantChangeLabel'

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
        <FormItem className={props.disabled && 'text-foreground/10'}>
          <FormLabel className="flex items-center text-lg">
            <CantChangeLabel label="Group Name" />
          </FormLabel>
          <FormDescription className={props.disabled && 'text-foreground/10'}>
            Your group name will be displayed on the Home Page and in search results.
          </FormDescription>
          <FormControl>
            <Input placeholder="Group Name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

import React from 'react'
import type { FieldValues } from 'react-hook-form'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/shad/ui/button'
import SelectToken from '@/components/SelectToken/SelectToken'
import { Trash2Icon } from 'lucide-react'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shad/ui/form'
import { Input } from '@/shad/ui/input'
import type { FormReturnType } from '@components/form/form.schema'
import { CantChangeLabel } from '@components/form/CantChangeLabel'

function TokenRequirementsForm({
  form,
  ...props
}: {
  form: FormReturnType
} & FieldValues) {
  const { watch } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tokenRequirements',
  })

  const reqMandatory = watch('reqMandatory')

  const addRequirement = () => {
    append({ address: '', name: '', decimals: 0, symbol: '' })
  }

  return (
    <>
      <FormField
        {...props}
        control={form.control}
        name="reqMandatory"
        render={({ field }) => (
          <FormItem className={props.disabled && 'text-foreground/10'}>
            <FormLabel className="flex items-center gap-4 text-lg">
              <Input
                className="h-6 w-6"
                {...field}
                onClick={() => {
                  if (fields.length === 0) {
                    addRequirement()
                  } else {
                    remove(0)
                  }
                }}
                name="reqMandatory"
                type="checkbox"
                placeholder="Require users to hold a minimum amount of tokens to join your community"
              />
              <div>
                <FormLabel className="flex items-center text-lg">
                  <CantChangeLabel label="Token Gated Community" />
                </FormLabel>
                <FormDescription className={props.disabled && 'text-foreground/10'}>
                  Require users to hold a minimum amount of tokens to join your community
                </FormDescription>
              </div>
              <FormMessage />
            </FormLabel>
          </FormItem>
        )}
      />

      <FormItem>
        {reqMandatory && (
          <div className="flex flex-col space-y-4">
            {fields.map((field, index) => {
              return (
                <FormControl key={field.id}>
                  <div className="flex items-center space-x-4">
                    <SelectToken fieldName={`tokenRequirements` as const} fieldIndex={index} />

                    <Input
                      {...form.register(`tokenRequirements.${index}.minAmount` as const)}
                      name={`tokenRequirements.${index}.minAmount`}
                      type="number"
                      onChange={e => {
                        const value = e.target.value
                        form.setValue(`tokenRequirements.${index}.minAmount`, value)
                      }}
                      step={0.01}
                      placeholder="Minimum Amount"
                    />

                    <Button
                      size="icon"
                      type="button"
                      className="shrink-0"
                      variant="destructive"
                      aria-label="Remove Token Requirement"
                      onClick={() => remove(index)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </FormControl>
              )
            })}
            <FormMessage />
            <Button type="button" onClick={addRequirement} variant="secondary">
              + Add Requirement
            </Button>
          </div>
        )}
      </FormItem>
    </>
  )
}

export default TokenRequirementsForm

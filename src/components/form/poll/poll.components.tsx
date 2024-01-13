import React from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { Textarea } from '@/shad/ui/textarea'

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shad/ui/form'
import { Input } from '@/shad/ui/input'
import { RadioGroup, RadioGroupItem } from '@/shad/ui/radio-group'
import { Label } from '@/shad/ui/label'
import type { PollCreationType } from '@components/form/poll/poll.schema'
import { Button } from '@/shad/ui/button'
import { PlusIcon } from '@heroicons/react/20/solid'

type PollFormProps = {
  form: UseFormReturn<PollCreationType>
}

export function PollTitleInput({ form }: PollFormProps) {
  return (
    <FormField
      control={form.control}
      name="title"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="text-xl">Title</FormLabel>
          <FormDescription>Enter the title for the poll (Max 60 characters).</FormDescription>
          <FormControl>
            <Input placeholder="Poll Title" {...field} />
          </FormControl>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  )
}

export function PollContentTextarea({ form }: PollFormProps) {
  return (
    <FormField
      control={form.control}
      name="content"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="text-xl">Content</FormLabel>
          <FormDescription>Describe the purpose of the poll.</FormDescription>
          <FormControl>
            <Textarea placeholder="Poll Description" {...field} />
          </FormControl>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  )
}

export function PollTypeSelect({ form }: PollFormProps) {
  return (
    <FormField
      control={form.control}
      name="pollType"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xl">Poll Type</FormLabel>
          <RadioGroup
            {...field}
            onValueChange={value => {
              form.setValue('pollType', Number(value), { shouldValidate: true })
            }}
            value={form.watch('pollType').toString()}
          >
            <FormMessage />
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="single-answer" value="0">
                Single Answer
              </RadioGroupItem>
              <Label htmlFor="single-answer">Single Answer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="multi-answer" value="1">
                Multi Answer
              </RadioGroupItem>
              <Label htmlFor="multi-answer">Multi Answer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="numeric-rating" value="2" />
              <Label htmlFor="numeric-rating">Numeric Rating</Label>
            </div>
          </RadioGroup>
        </FormItem>
      )}
    />
  )
}

// Helper component to render poll options dynamically
export function PollOptionsInput({ form }: PollFormProps) {
  // Render a text input for each poll option

  const handleRemoveOption = (index: number) => {
    const options = form.watch('options')
    options.splice(index, 1)
    form.setValue('options', options)
  }

  const renderOptions = () => {
    return form.watch('options').map((option, index) => (
      <Controller
        key={index}
        control={form.control}
        name={`options.${index}`}
        render={({ field, fieldState }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-2">
              <Input placeholder={`Option ${index + 1}`} {...field} />
              <Button type="button" variant="outline" onClick={() => handleRemoveOption(index)}>
                -
              </Button>
            </div>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </FormItem>
        )}
      />
    ))
  }

  const handleAddOption = () => {
    form.setValue('options', [...form.watch('options'), ''])
  }

  return (
    <>
      <FormItem>
        <FormLabel className="flex items-center justify-between text-xl">
          Poll Options
          <Button type="button" variant="ghost" onClick={handleAddOption}>
            <PlusIcon width={24} height={24} /> Add Option
          </Button>
        </FormLabel>
        <FormDescription>Enter the options for the poll.</FormDescription>
        {renderOptions()}
        <FormMessage>{form.formState.errors.options?.message}</FormMessage>
      </FormItem>
    </>
  )
}

export function PollDurationInput({ form }: PollFormProps) {
  return (
    <FormField
      control={form.control}
      name="duration"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="text-xl">Duration (In Hours)</FormLabel>
          <FormDescription>Set the duration for how long the poll should last.</FormDescription>
          <FormControl>
            <Input type="number" placeholder="Duration in hours" {...field} />
          </FormControl>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  )
}

export function PollNumericRatingInput({ form }: PollFormProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="numericRating.rateScaleFrom"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-xl">Numeric Rating Scale</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Rate Scale To" {...field} />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="numericRating.rateScaleTo"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormControl>
              <Input type="number" placeholder="Rate Scale From" {...field} />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </FormItem>
        )}
      />
    </>
  )
}

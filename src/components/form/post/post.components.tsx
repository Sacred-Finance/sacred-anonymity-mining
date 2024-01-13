import React from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shad/ui/form'
import { Input } from '@/shad/ui/input'
import { RadioGroup, RadioGroupItem } from '@/shad/ui/radio-group'
import { Label } from '@/shad/ui/label'
import type { PostCreationType } from '@components/form/post/post.schema'
import dynamic from 'next/dynamic'
import { CommentCreationType } from '@components/form/post/post.schema'
import { Textarea } from '@/shad/ui/textarea'

const Editor = dynamic(() => import('@components/editor-js/Editor'), {
  ssr: false,
})
type PostFormProps = {
  form: UseFormReturn<PostCreationType | CommentCreationType>
}

export function PostTitleInput({ form, ...props }: PostFormProps) {
  return (
    <FormField
      {...props}
      control={form.control}
      name="title"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="text-xl">Title</FormLabel>
          <FormDescription>Enter the title for the post (Max 60 characters).</FormDescription>
          <FormControl>
            <Input placeholder="Post Title" {...field} />
          </FormControl>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  )
}

export function PostContentTextarea({ form }) {
  return (
    <FormField
      control={form.control}
      name="content"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="text-xl">{field.name}</FormLabel>
          <FormDescription>Describe the purpose of the post.</FormDescription>
          <FormControl>
            <Textarea
              readOnly={false}
              className="focus:ring-primary-dark rounded-md bg-gray-100 p-4 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:!text-white"
              {...field}
            />
          </FormControl>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  )
}

export function PostTypeSelect({ form }: PostFormProps) {
  return (
    <FormField
      control={form.control}
      name="postType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Post Type</FormLabel>
          <RadioGroup
            {...field}
            onValueChange={value => {
              form.setValue('postType', Number(value), { shouldValidate: true })
            }}
            value={form.watch('postType').toString()}
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

// Helper component to render post options dynamically
export function PostOptionsInput({ form }: PostFormProps) {
  // Render a text input for each post option
  const renderOptions = () => {
    return form.watch('options').map((option, index) => (
      <Controller
        key={index}
        control={form.control}
        name={`options.${index}`}
        render={({ field, fieldState }) => (
          <FormItem>
            <Input placeholder={`Option ${index + 1}`} {...field} />
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
        <FormLabel>
          Post Options
          <button onClick={handleAddOption}>Add Option</button>
        </FormLabel>
        <FormDescription>Enter the options for the post.</FormDescription>
        {renderOptions()}
        <FormMessage>{form.formState.errors.options?.message}</FormMessage>
      </FormItem>
    </>
  )
}

export function PostDurationInput({ form }: PostFormProps) {
  return (
    <FormField
      control={form.control}
      name="duration"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Duration (In Hours)</FormLabel>
          <FormDescription>Set the duration for how long the post should last.</FormDescription>
          <FormControl>
            <Input type="number" placeholder="Duration in hours" {...field} />
          </FormControl>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  )
}

export function PostNumericRatingInput({ form }: PostFormProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="numericRating.rateScaleFrom"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Numeric Rating Scale</FormLabel>
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

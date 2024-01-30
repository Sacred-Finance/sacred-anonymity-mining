import React from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shad/ui/form'
import { Input } from '@/shad/ui/input'
import type { CommentCreationType, PostCreationType } from '@components/form/post/post.schema'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@components/ErrorBoundary'
import { ScrollArea, ScrollBar } from '@/shad/ui/scroll-area'

const Editor = dynamic(() => import('@components/editor-js/Editor'), {
  ssr: false,
})
type PostFormProps = {
  form: UseFormReturn<PostCreationType | CommentCreationType>
  label?: string | React.ReactNode
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
            <Input
              placeholder="Post Title"
              {...field}
              onChange={e => {
                console.log('e', e)
                form.setValue('title', e.target.value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
              }}
            />
          </FormControl>
          {/*<FormMessage>{fieldState.error?.message}</FormMessage>*/}
        </FormItem>
      )}
    />
  )
}

export function PostContentTextarea({ form, label = 'Content' }: PostFormProps) {
  const handleChange = async data => {
    console.log('handle change', data)
    await form.setValue('description', data, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
    await form.trigger('description')
    console.log('form', form.formState.errors, form.getValues())
  }
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xl">{label}</FormLabel>
          <FormDescription>Describe the purpose of the post.</FormDescription>
          <FormControl>
            <div>
              <ErrorBoundary>
                <Editor
                  holder="description"
                  data={field.value}
                  readOnly={false}
                  placeholder="Start writing your post..."
                  onChange={async data => {
                    await handleChange(data)
                  }}
                />
              </ErrorBoundary>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  )
}

// Helper component to render post options dynamically

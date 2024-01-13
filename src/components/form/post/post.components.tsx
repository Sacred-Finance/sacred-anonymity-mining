import React from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shad/ui/form'
import { Input } from '@/shad/ui/input'
import type { CommentCreationType, PostCreationType } from '@components/form/post/post.schema'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@components/ErrorBoundary'

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

export function PostContentTextarea({ form }: PostFormProps) {
  return (
    <FormField
      control={form.control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xl">Content</FormLabel>
          <FormDescription>Describe the purpose of the post.</FormDescription>
          <FormControl>
            <div>
              <FormMessage />
              <ErrorBoundary>
                <Editor
                  holder="content"
                  data={form.watch('content')}
                  readOnly={false}
                  onChange={data => {
                    console.log(data)
                    form.setValue('content', data, { shouldValidate: true })
                  }}
                  divProps={{
                    className:
                      'rounded-md bg-gray-100 dark:bg-gray-800 dark:!text-white p-4 focus:outline-none focus:ring-2 focus:ring-primary-dark',
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

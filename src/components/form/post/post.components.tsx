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
          <FormLabel className="text-xl">Content</FormLabel>
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
                  divProps={{
                    className:
                      'rounded-md bg-gray-100 dark:bg-gray-800 dark:!text-white p-4 focus:outline-none focus:ring-2 focus:ring-primary-dark',
                  }}
                />
                {/*<Editor*/}
                {/*  holder={`${post?.id}_${isTypeOfPost ? 'post' : 'comment'}`}*/}
                {/*  readOnly={!isContentEditing}*/}
                {/*  onChange={val => setContentDescription(val)}*/}
                {/*  placeholder={t('placeholder.enterPostContent') as string}*/}
                {/*  data={post?.description ? post.description : post}*/}
                {/*  divProps={{*/}
                {/*    className:*/}
                {/*      'rounded-md bg-gray-100 dark:bg-gray-800 dark:!text-white p-4 focus:outline-none focus:ring-2 focus:ring-primary-dark',*/}
                {/*  }}*/}
                {/*/>*/}

                <FormMessage>{form.formState.errors.description?.message}</FormMessage>
                {/*<Input type={'hidden'} {...field} />*/}
              </ErrorBoundary>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Helper component to render post options dynamically

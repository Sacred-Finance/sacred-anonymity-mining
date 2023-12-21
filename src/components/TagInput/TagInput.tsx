import { Controller, useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shad/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/shad/ui/popover'
import { Button } from '@/shad/ui/button'
import { cn } from '@/shad/lib/utils'
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shad/ui/command'
import { TAGS } from '@/constant/tags'
import { FaCaretRight } from 'react-icons/fa'
import { BsCheckCircle } from 'react-icons/bs'
import React from 'react'

export default function ComboboxForm() {
  const { control, setValue, watch } = useFormContext()
  const selectedTags = watch('tags')

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setValue(
        'tags',
        selectedTags.filter((t: string) => t !== tag),
        { shouldDirty: true, shouldValidate: true, shouldTouch: true }
      )
    } else {
      setValue('tags', [...selectedTags, tag], {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      })
    }
  }

  return (
    <FormItem>
      <FormLabel className="text-lg">
        Tags
        <FormDescription>
          Add tags to help people find your group
        </FormDescription>
      </FormLabel>
      <FormControl>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <div className="flex flex-wrap gap-y-4 space-x-4">
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value?.length
                        ? `${field.value.length} tag${
                            field.value.length === 1 ? '' : 's'
                          } selected`
                        : 'Select tags'}
                      <FaCaretRight className="float-right ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="max-h-96 overflow-y-auto">
                  <Command>
                    <CommandInput placeholder="Type a command or search..." />

                    <CommandSeparator />

                    <CommandList>
                      {TAGS.map(tag => (
                        <CommandItem
                          key={tag}
                          onSelect={() => toggleTag(tag)}
                          className="flex items-center justify-between"
                        >
                          {tag}
                          {selectedTags.includes(tag) && (
                            <BsCheckCircle className="overflow-visible text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {field.value?.map((tag: string) => (
                <Button key={tag} onClick={() => toggleTag(tag)}>
                  {tag}
                </Button>
              ))}
            </div>
          )}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

import { useForm } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shad/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/shad/ui/popover'
import { Button } from '@/shad/ui/button'
import { cn } from '@/shad/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/shad/ui/command'
import { CheckIcon } from '@heroicons/react/20/solid'
import { TAGS } from '@/constant/tags'
import { FaCaretRight } from 'react-icons/fa'
import { hexToString } from 'viem'

export default function ComboboxForm({
  form,
}: {
  form: ReturnType<typeof useForm>
}) {
  // Function to toggle a tag in the array
  const toggleTag = (tag: string) => {
    const currentTags = form.getValues('tags') || []
    if (currentTags.includes(tag)) {
      form.setValue(
        'tags',
        currentTags.filter((t: `0x${string}`) => t !== tag),
        { shouldValidate: true }
      )
    } else {
      form.setValue('tags', [...currentTags, tag], { shouldValidate: true })
    }
  }

  // Function to check if a tag is selected
  const isTagSelected = (tag: string) => {
    const currentTags = form.getValues('tags') || []
    return currentTags.includes(tag)
  }

  return (
    <FormField
      control={form.control}
      name="tags"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <div className="inline-flex h-10 items-center gap-2">
            <FormLabel>Tags</FormLabel>
            {field.value?.map((tag: string) => (
              <Button
                key={tag}
                variant="outline"
                className="text-muted-foreground"
                onClick={() => toggleTag(tag)}
              >
                {hexToString(tag)}
              </Button>
            ))}
          </div>
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
            <PopoverContent className="max-h-96 overflow-y-auto p-0">
              <Command>
                <CommandInput
                  placeholder="Search for tags..."
                  className="h-9"
                />
                <CommandEmpty>No tags found.</CommandEmpty>
                <CommandGroup>
                  {TAGS.map(tag => (
                    <CommandItem
                      value={tag}
                      key={tag}
                      onSelect={() => toggleTag(tag)}
                    >
                      {tag}
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          isTagSelected(tag) ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormDescription>
            These tags will help people find your group
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

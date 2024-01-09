import clsx from 'clsx'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { FileUploader } from 'react-drag-drop-files'
import { BsImages } from 'react-icons/bs'

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shad/ui/form'
import _ from 'lodash'
import type { FormReturnType, ImageFile } from './form.schema'

interface ImageUploaderProps {
  name: 'bannerFile' | 'logoFile'
  form: FormReturnType
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ name, form }) => {
  useEffect(() => {
    const file = form.getValues(name)
    if (file && 'size' in file) {
      const previewUrl = URL.createObjectURL(file)

      // Clean up the preview URL
      return () => URL.revokeObjectURL(previewUrl)
    }
  }, [form, name])

  const handleChange = (file: File) => {
    const imageFile: ImageFile = file as ImageFile
    form.setValue(name, imageFile, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const isLogo = name === 'logoFile'

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-2">
          <FormLabel className="text-lg">{isLogo ? 'Group Logo' : 'Group Banner'}</FormLabel>
          <FormDescription>Add a {_.startCase(name)}</FormDescription>

          <FormControl>
            <FileUploader
              classes="flex justify-center flex-col
              items-center gap-3  p-2 rounded group cursor-pointer duration-150 transition-all"
              handleChange={handleChange}
              types={['JPG', 'PNG', 'JPEG', 'WEBP', 'GIF']}
              {...field}
            >
              {field.value ? (
                <Image
                  height={240}
                  width={240}
                  src={URL.createObjectURL(field?.value)}
                  alt={isLogo ? 'Group Logo' : 'Group Banner'}
                  className={clsx(
                    'rounded object-cover group-hover:scale-105',
                    isLogo ? 'aspect-[1] h-60 w-60 min-w-60 shrink-0' : 'h-60 w-full'
                  )}
                />
              ) : (
                <div className="flex h-60 w-full cursor-pointer flex-col items-center justify-center group-hover:scale-105  md:flex-row">
                  <BsImages size={240} />
                </div>
              )}

              {field.value && 'size' in field.value && (
                <div className=" flex w-full flex-col items-end justify-center gap-2">
                  <span className="line-clamp-3 text-end text-sm text-foreground transition-all  duration-150 group-hover:line-clamp-none">
                    {field.value.name}
                  </span>
                  <span className="text-xs text-foreground/50">{field.value.size} bytes</span>
                </div>
              )}
            </FileUploader>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default ImageUploader

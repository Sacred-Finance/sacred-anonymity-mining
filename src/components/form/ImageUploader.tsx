import React from 'react'
import Image from 'next/image'
import type { UseFormReturn } from 'react-hook-form'
import { BsImages } from 'react-icons/bs'
import { FileUploader } from 'react-drag-drop-files'
import clsx from 'clsx'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shad/ui/form'

interface ImageUploaderProps {
  name: 'bannerFile' | 'logoFile'
  initialImageUrl?: URL | null
  form: UseFormReturn<
    {
      groupName: string
      description: string
      tags?: string[] | undefined
      bannerFile?: { type: string; size: number } | undefined
      logoFile?: { type: string; size: number } | undefined
    },
    undefined
  >
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ name, form }) => {
  const handleChange = (file: File) => {
    form.setValue(name, file, {
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
        <FormItem className="flex flex-col space-y-2 ">
          <FormLabel className="text-lg ">
            {name === 'logoFile' ? 'Group Logo' : 'Group Banner'}
          </FormLabel>
          <FormControl>
            <FileUploader
              {...field}
              handleChange={(file: File) => handleChange(file)}
              types={['JPG', 'PNG', 'JPEG', 'WEBP', 'GIF']}
            >
              {field?.value?.size ? (
                <Image
                  height={240}
                  width={240}
                  src={
                    field?.value?.size
                      ? URL.createObjectURL(field?.value)
                      : undefined
                  }
                  alt="Selected"
                  className={clsx(
                    'rounded',
                    isLogo ? 'h-60 w-60' : 'w-full h-60'
                  )}
                />
              ) : (
                <div className="flex h-60 w-full cursor-pointer flex-col items-center justify-center  hover:scale-105 md:flex-row">
                  <BsImages size={240} />
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

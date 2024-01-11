import Image from 'next/image'
import React, { useEffect } from 'react'
import { FileUploader } from 'react-drag-drop-files'

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shad/ui/form'
import type { FormReturnType, ImageFile } from './form.schema'
import { TbDragDrop } from 'react-icons/tb'
import { cx } from 'class-variance-authority'
import { ImagePlus } from 'lucide-react'

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
        <FormItem className={cx(`group relative flex h-full w-full flex-col`)}>
          <FormLabel className="text-lg">{isLogo ? 'Group Logo' : 'Group Banner'}</FormLabel>
          <FormDescription></FormDescription>

          <FormControl>
            <FileUploader
              handleChange={handleChange}
              types={['JPG', 'PNG', 'JPEG', 'WEBP', 'GIF']}
              {...field}
              classes={cx(
                'flex items-center rounded-xl w-full h-full group  justify-center border-2 border-dashed border-foreground/30  bg-background transition duration-150 hover:border-foreground/90 hover:scale-[101%] will-change-transform'
              )}
            >
              {!field.value ? (
                <div className="flex h-[250px] w-full   items-center justify-center gap-4">
                  <div className="group-hover:hidden">
                    <TbDragDrop size={100} />
                    Drag and Drop
                  </div>
                  <div className="hidden group-hover:block">
                    <ImagePlus size={100} />
                    Select a File
                  </div>
                </div>
              ) : (
                <div className="flex h-[250px] w-full items-center  justify-center group-hover:opacity-75 ">
                  <Image
                    width={250}
                    height={250}
                    src={URL.createObjectURL(field.value)}
                    alt={isLogo ? 'Group Logo' : 'Group Banner'}
                    className="h-full w-full rounded-xl object-cover"
                  />
                </div>
              )}
            </FileUploader>
          </FormControl>
          {field.value && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between rounded-xl bg-black/60 p-2 opacity-5  group-hover:opacity-100">
              <span className="truncate text-sm text-foreground">{field.value.name}</span>
              <span className="text-xs text-foreground">{`${(field.value.size / 1024).toFixed(2)} KB`}</span>
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default ImageUploader

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import type { UseFormReturn } from 'react-hook-form'
import { Input } from '@/shad/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shad/ui/form'
import { Button } from '@/shad/ui/button'
import { BsImages, BsPaperclip } from 'react-icons/bs'
import { Label } from '@/shad/ui/label'
interface ImageUploaderProps {
  name: 'bannerFile' | 'logoFile'
  initialImageUrl?: File | null
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

const ImageUploader: React.FC<ImageUploaderProps> = ({
  name,
  form,
  initialImageUrl,
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  useEffect(() => {
    setSelectedImage(initialImageUrl ? initialImageUrl : null)
  }, [initialImageUrl])

  return (
    <div
      className={`flex w-[100%] gap-4 p-4 rounded border border-neutral-200 flex-col items-center md:flex-row md:justify-between md:items-center`}
    >
      <div
        className={`flex  md:flex-[1] h-[fit-content] md:p-4 md:justify-between md:flex-row 
                        
            `}
      >
        {selectedImage ? (
          <div className="md:max-w-[200px]">
            <img src={selectedImage} alt="Selected" />
          </div>
        ) : (
          <div className="inline-flex items-center justify-between">
            <div className="flex items-center  justify-center bg-slate-200 p-3">
              <BsImages size={56} />
            </div>
          </div>
        )}
      </div>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Label
                htmlFor="fileInput"
                className="flex items-center gap-4 rounded bg-primary p-4 text-sm hover:scale-105 hover:cursor-pointer"
              >
                <BsPaperclip className={'w-10 h-10'} />
                choose your {name === 'bannerFile' ? 'banner' : 'logo'}
                <Input
                  type="file"
                  className="hidden"
                  id="fileInput"
                  onBlur={field.onBlur}
                  name={field.name}
                  onChange={e => {
                    if (e.target.files?.[0] !== initialImageUrl) {
                      field.onChange(e.target.files)
                      setSelectedImage(
                        URL.createObjectURL(e.target.files?.[0]) || null
                      )
                    }
                  }}
                  ref={field.ref}
                />
              </Label>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default ImageUploader

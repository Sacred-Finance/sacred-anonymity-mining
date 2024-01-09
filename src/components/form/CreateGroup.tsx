import { CircularLoader } from '@components/CircularLoader'
import { CreateGroupSchema } from '@components/form/form.schema'
import ImageUploader from '@components/form/ImageUploader'
import { InputGroupDescription } from '@components/form/InputGroupDescription'
import { InputGroupName } from '@components/form/InputGroupName'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/shad/ui/button'
import { Form, FormMessage } from '@/shad/ui/form'
import { Label } from '@/shad/ui/label'

import TagInput from '../TagInput/TagInput'
import { useCreateCommunity } from '@/hooks/useCreateCommunity'
import TokenRequirementsForm from '@components/tokenRequirement/tokenRequirements'
import { polygonMumbai } from 'wagmi/chains'
import type zod, { z } from 'zod'
import _ from 'lodash'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'

export function CreateGroup() {
  const { t } = useTranslation()
  const form = useForm<z.infer<typeof CreateGroupSchema>>({
    resolver: zodResolver(CreateGroupSchema),
    defaultValues: {
      groupName: '',
      description: '',
      tags: [],
      tokenRequirements: [],
      reqMandatory: false,
      logoFile: undefined,
      bannerFile: undefined,
    },
  })
  const router = useRouter()

  const { handleSubmit } = form

  // get errors from form
  const { errors } = form.formState

  // Assume onCreateGroupClose is a function that handles the closing of the group creation modal or redirects the user
  const createCommunity = useCreateCommunity(() => {
    router.push('/')
  })

  const onSubmit = async (data: zod.infer<typeof CreateGroupSchema> & { logoFile: File; bannerFile: File }) => {
    try {
      const name = data.groupName
      const description = data.description
      const chainId = polygonMumbai.id // Example: Set chainId

      const requirements =
        data?.tokenRequirements?.map(v => {
          return {
            ...v,
            tokenAddress: v?.address,
            minAmount: ethers.utils.parseUnits(v?.minAmount.toString(), v?.decimals).toString(),
          }
        }) || []

      const response = await createCommunity({
        name,
        tokenRequirements: requirements,
        chainId,
        description,
        bannerFile: data.bannerFile,
        logoFile: data.logoFile,
        tags: data.tags || [],
        note: BigInt(0).toString(),
      })
      if (response) {
        // Handle success, such as showing a success message
        console.log('success')
        toast.success('Group created successfully')
      }
    } catch (error) {
      console.error(error)
      // Handle error, such as showing an error message
    }
  }

  return (
    <div className="relative z-50 max-w-screen-2xl">
      <Form {...form}>
        <form className="space-y-12 bg-white/5 p-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex w-full justify-between">
            <Label className="flex items-center gap-2 text-2xl font-semibold text-gray-700 dark:text-gray-300">
              <span> Create Group</span>
            </Label>
          </div>

          <InputGroupName form={form} />
          <InputGroupDescription form={form} />

          <div className="flex flex-col flex-wrap items-start justify-center md:flex-row ">
            <div className="flex shrink-0 basis-1/3 items-center justify-center">
              <ImageUploader form={form} name="logoFile" />
            </div>
            <div className="flex shrink-0 basis-2/3 items-center justify-center">
              <ImageUploader form={form} name="bannerFile" />
            </div>
          </div>

          <TagInput />
          <TokenRequirementsForm form={form} />

          {Object.keys(errors).length > 0 && <div className="flex flex-col space-y-2">{renderErrors(errors)}</div>}
          <div className="flex w-full justify-end">
            <Button type="submit">
              {form.formState.isValidating || form.formState.isSubmitting ? <CircularLoader /> : t('button.create')}
            </Button>
          </div>
          <FormMessage />
        </form>
      </Form>
    </div>
  )
}
function renderErrors(errors) {
  return Object.keys(errors).map((key, index) => {
    if (errors[key] && typeof errors[key] === 'object' && errors[key].message) {
      return (
        <div key={index} className="text-red-500">
          {errors[key].message} - {_.startCase(errors[key].type)}
          {errors[key].nestedErrors ? renderErrors(errors[key].nestedErrors) : null}
        </div>
      )
    } else if (errors[key] && typeof errors[key] === 'string') {
      return (
        <div key={index} className="text-red-500">
          {key} {errors[key]}
        </div>
      )
      // if array
    } else if (errors[key] && Array.isArray(errors[key])) {
      return renderErrors(errors[key])
    } else if (errors[key] && typeof errors[key] === 'object') {
      return renderErrors(errors[key])
    }
    return null
  })
}

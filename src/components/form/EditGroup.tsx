import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { useTranslation } from 'next-i18next'
import { useFetchCommunitiesByIds } from '@/hooks/useFetchCommunities'
import React, { useCallback, useEffect, useState } from 'react'
import { constants } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'
import {
  createInputNote,
  generateGroth16Proof,
  getBytes32FromIpfsHash,
  getBytes32FromString,
} from '@/lib/utils'
import { uploadImages } from '@/utils/communityUtils'
import { setGroupDetails } from '@/lib/api'
import { toast } from 'react-toastify'
import type { HandleSetImage } from '@pages/communities/[groupId]/edit'
import type { Group } from '@/types/contract/ForumInterface'
import RemoveGroup from '@components/RemoveGroup'
import TagInput from '../TagInput/TagInput'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { InputGroupName } from '@components/form/InputGroupName'
import type { FieldValues } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { groupSchema } from '@components/form/form.schema'
import { Form } from '@/shad/ui/form'
import type { z } from 'zod'
import { Button, buttonVariants } from '@/shad/ui/button'
import ImageUploader from '@components/form/ImageUploader'
import { InputGroupDescription } from '@components/form/InputGroupDescription'
import type { Hex } from 'viem'
import { hexToString } from 'viem'
import { CircularLoader } from '@components/CircularLoader'
import { cn } from '@/shad/lib/utils'
import type { BigNumberish } from '@semaphore-protocol/group'

interface EditGroupProps {
  group: Group
}

export function EditGroup({ group }: EditGroupProps) {
  const router = useRouter()
  const { address } = useAccount()
  const { t } = useTranslation()

  const handleUpdateStateAfterEdit = useFetchCommunitiesByIds(
    [Number(group.groupId)],
    false
  )

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [bannerFile, setBannerFile] = useState<File | undefined>(undefined)
  const [logoFile, setLogoFile] = useState<File | undefined>(undefined)

  // Helper function to fetch and handle the image
  const fetchImage = (
    imagePath: string,
    imageType: HandleSetImage['imageType']
  ) => {
    fetch('https://ipfs.io/ipfs/' + imagePath)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], imageType, { type: blob.type })
        handleSetImage({ file, imageType })
      })
  }

  useEffect(() => {
    if (group.groupDetails.bannerCID) {
      fetchImage(group.groupDetails.bannerCID, 'banner')
    }
    if (group.groupDetails.logoCID) {
      fetchImage(group.groupDetails.logoCID, 'logo')
    }
  }, [])

  const handleSetImage = ({ file, imageType }: HandleSetImage): void => {
    const setImage = imageType === 'logo' ? setLogoFile : setBannerFile
    setImage(file as File)
  }

  const form = useForm<z.infer<typeof groupSchema>>({
    resolver: zodResolver(groupSchema),
    values: {
      groupName: group.name,
      description: group.groupDetails.description,
      tags:
        group.groupDetails.tags?.map(tag =>
          hexToString(tag as Hex, { size: 32 })
        ) || [],
      bannerFile: bannerFile,
      logoFile: logoFile,
    },
  })

  const submitAllGroupDetails = useCallback(
    async (data: FieldValues) => {
      const hasImageChanged = {
        logo: data.logoFile.size !== logoFile?.size,
        banner: data.bannerFile.size !== bannerFile?.size,
      }
      try {
        setIsSubmitting(true)
        const user = new Identity(address)
        const input = await createInputNote(user)
        const { a, b, c } = await generateGroth16Proof({ input })

        const images = {
          bannerFile: hasImageChanged.banner && data.bannerFile,
          logoFile: hasImageChanged.logo && data.logoFile,
        }

        let { bannerCID, logoCID } = await uploadImages(images)
        if (!bannerCID) bannerCID = group.groupDetails.bannerCID
        if (!logoCID) logoCID = group.groupDetails.logoCID

        const mergedGroupDetails = {
          description: data.description,
          groupName: data.groupName,
          bannerCID: bannerCID
            ? getBytes32FromIpfsHash(bannerCID)
            : constants.HashZero,
          logoCID: logoCID
            ? getBytes32FromIpfsHash(logoCID)
            : constants.HashZero,
          tags: data.tags.map((tag: string) => {
            return getBytes32FromString(tag)
          }),
        }

        setGroupDetails(
          group.groupId as string,
          a,
          b,
          c,
          mergedGroupDetails,
          false
        )
          .then(async () => {
            await handleUpdateStateAfterEdit()
            await router.push(`/communities/${group.groupId}`)
          })
          .catch(error => {
            toast.error(`Something went wrong ${error.message}`)
            setIsSubmitting(false)
          })
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message)
        }
        // setIsSubmitting(false)
      }
    },
    [
      address,
      bannerFile?.size,
      group.groupDetails.bannerCID,
      group.groupDetails.logoCID,
      group.groupId,
      handleUpdateStateAfterEdit,
      logoFile?.size,
      router,
    ]
  )

  const previousPageUrl = router.query.previousPageUrl as string

  return (
    <div className="relative z-50 max-w-screen-2xl ">
      <Form {...form}>
        <form
          className="space-y-3 bg-white/5 p-6"
          onSubmit={form.handleSubmit(async data => {
            await submitAllGroupDetails(data)
          })}
        >
          <div className="flex w-full justify-between">
            <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
              {t('editCommunity')}
            </h1>
            <div className="flex items-center justify-end gap-2">
              <Link
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                    className: '',
                    size: 'sm',
                  }),
                  'mr-2'
                )}
                href={
                  previousPageUrl ? previousPageUrl : `/communities/${group.id}`
                }
              >
                <ArrowLeftIcon className="h-6 w-6" />
                Back
              </Link>

              <RemoveGroup
                groupId={group.groupId as BigNumberish}
                hidden={false}
              />
            </div>
          </div>

          <InputGroupName form={form} />
          <InputGroupDescription form={form} />

          <div className="flex w-full flex-wrap gap-4">
            <ImageUploader form={form} name="logoFile" />
            <ImageUploader form={form} name="bannerFile" />
          </div>

          <TagInput />

          <div className="flex w-full justify-end">
            <Button
              type="submit"
              disabled={
                !form.formState.isDirty ||
                !form.formState.isValid ||
                isSubmitting ||
                form.formState.isLoading ||
                form.formState.isValidating
              }
            >
              {isSubmitting ||
              form.formState.isLoading ||
              form.formState.isValidating ? (
                <CircularLoader />
              ) : (
                t('button.save')
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

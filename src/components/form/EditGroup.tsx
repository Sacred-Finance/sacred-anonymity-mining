import { CircularLoader } from '@components/CircularLoader'
import { EditGroupSchema } from '@components/form/form.schema'
import ImageUploader from '@components/form/ImageUploader'
import { InputGroupDescription } from '@components/form/InputGroupDescription'
import { InputGroupName } from '@components/form/InputGroupName'
import RemoveGroup from '@components/RemoveGroup'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import { zodResolver } from '@hookform/resolvers/zod'
import type { HandleSetImage } from '@pages/communities/[groupId]/edit'
import type { BigNumberish } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import { constants } from 'ethers'
import _ from 'lodash'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useEffect, useState } from 'react'
import type { FieldValues } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import type { Hex } from 'viem'
import { hexToString } from 'viem'
import { useAccount } from 'wagmi'
import type { z } from 'zod'

import { useCommunityContext } from '@/contexts/CommunityProvider'
import { useAdminEditGroupDetails } from '@/hooks/useAdminEditGroupDetails'
import { useFetchCommunitiesByIds } from '@/hooks/useFetchCommunities'
import { setGroupDetails } from '@/lib/api'
import { createInputNote, generateGroth16Proof, getBytes32FromIpfsHash, getBytes32FromString } from '@/lib/utils'
import { cn } from '@/shad/lib/utils'
import { Button, buttonVariants } from '@/shad/ui/button'
import { Form } from '@/shad/ui/form'
import { Label } from '@/shad/ui/label'
import type { Group } from '@/types/contract/ForumInterface'

import TagInput from '../TagInput/TagInput'
import { useCheckIsOwner } from '@components/EditGroupNavigationButton'
import { uploadImages } from '@/utils/communityUtils'

interface EditGroupProps {
  group: Group
}

export function EditGroup({ group }: EditGroupProps) {
  const router = useRouter()
  const { address } = useAccount()
  const { t } = useTranslation()

  const handleUpdateStateAfterEdit = useFetchCommunitiesByIds([Number(group.groupId)], false)

  const {
    state: { isAdmin },
  } = useCommunityContext()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [bannerFile, setBannerFile] = useState<File | undefined>(undefined)
  const [logoFile, setLogoFile] = useState<File | undefined>(undefined)

  const handleSetImage = ({ file, imageType }: HandleSetImage): void => {
    const setImage = imageType === 'logo' ? setLogoFile : setBannerFile
    setImage(file as File)
  }
  const fetchImage = async (imagePath: string, imageType: HandleSetImage['imageType']) => {
    try {
      const url = 'https://ipfs.io/ipfs/' + imagePath
      const result = await fetch(url)

      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`)
      }
      const blob = await result.blob()
      if (!blob.type.startsWith('image/')) {
        throw new Error('Fetched file is not an image')
      }

      const file = new File([blob], imageType, { type: blob.type })
      handleSetImage({ file, imageType })
    } catch (error) {
      console.error('error fetching image', error)
    }
  }

  useEffect(() => {
    console.log('group.groupDetails', group.groupDetails)
    if (group.groupDetails.bannerCID) {
      fetchImage(group.groupDetails.bannerCID, 'banner')
    }
    if (group.groupDetails.logoCID) {
      fetchImage(group.groupDetails.logoCID, 'logo')
    }
  }, [])

  const form = useForm<z.infer<typeof EditGroupSchema>>({
    resolver: zodResolver(EditGroupSchema),
    defaultValues: {
      groupName: group.name,
      description: group.groupDetails.description,
      tags: group.groupDetails.tags?.map(tag => hexToString(tag as Hex, { size: 32 })) || [],
      bannerFile: bannerFile,
      logoFile: logoFile,
    },
    values: {
      groupName: group.name,
      description: group.groupDetails.description,
      tags: group.groupDetails.tags?.map(tag => hexToString(tag as Hex, { size: 32 })) || [],
      bannerFile: bannerFile,
      logoFile: logoFile,
    },
  })

  const { editGroupDetails } = useAdminEditGroupDetails(group.groupId, isAdmin)
  const { isOwner } = useCheckIsOwner(group, address)

  const submitAllGroupDetails = useCallback(
    async (data: FieldValues) => {
      try {
        setIsSubmitting(true)
        const hasImageChanged = {
          logo: data?.logoFile?.size !== logoFile?.size,
          banner: data?.bannerFile?.size !== bannerFile?.size,
        }
        const { bannerCID, logoCID } = await uploadImages({
          bannerFile: hasImageChanged.banner && data.bannerFile,
          logoFile: hasImageChanged.logo && data.logoFile,
        })

        const mergedGroupDetails = {
          description: data.description,
          groupName: data.groupName,
          bannerCID: bannerCID ? getBytes32FromIpfsHash(bannerCID) : constants.HashZero,
          logoCID: logoCID ? getBytes32FromIpfsHash(logoCID) : constants.HashZero,
          tags: data.tags.map((tag: string) => getBytes32FromString(tag)),
        }

        if (isAdmin && !isOwner) {
          await editGroupDetails(mergedGroupDetails)
          // toast.success('Group details updated')
        } else {
          const input = await createInputNote(new Identity(address))
          const proof = await generateGroth16Proof({ input })

          await setGroupDetails({
            groupId: group.groupId as string,
            a: proof.a,
            b: proof.b,
            c: proof.c,
            details: mergedGroupDetails,
            isAdmin: false,
          })
        }

        await handleUpdateStateAfterEdit()
        await router.push(`/communities/${group.groupId}`)
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Something went wrong: ${error.message}`)
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      address,
      bannerFile?.size,
      group,
      handleUpdateStateAfterEdit,
      isAdmin,
      logoFile?.size,
      router,
      editGroupDetails, // Don't forget to include editGroupDetails in the dependency array
    ]
  )

  const previousPageUrl = router.query.previousPageUrl as string

  return (
    <div className="relative z-50 max-w-screen-2xl ">
      <Form {...form}>
        <form
          className="space-y-12 bg-white/5 p-6"
          onSubmit={form.handleSubmit(async data => {
            await submitAllGroupDetails(data)
          })}
        >
          <div className="flex w-full justify-between">
            <Link
              className={cn(
                'group flex items-center',
                buttonVariants({
                  variant: 'link',
                  className: 'ps-0 ',
                })
              )}
              href={previousPageUrl ? previousPageUrl : `/communities/${group.id}`}
            >
              <Label className="flex cursor-pointer items-center gap-2 text-2xl font-semibold text-gray-700 group-hover:text-primary/90  dark:text-gray-300">
                <ArrowLeftIcon className="w-10" />
                <span> {_.startCase(group.name)}</span>
              </Label>
            </Link>
            <div className="flex items-center justify-end gap-2">
              <RemoveGroup groupId={group.groupId as BigNumberish} hidden={false} />
            </div>
          </div>

          <InputGroupName form={form} disabled />
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

          <div className="flex w-full justify-end">
            <Button type="submit" disabled={!form.formState.isDirty || isSubmitting}>
              {isSubmitting || form.formState.isLoading || form.formState.isValidating ? (
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

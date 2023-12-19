import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { useTranslation } from 'next-i18next'
import { useFetchCommunitiesByIds } from '@/hooks/useFetchCommunities'
import React, { useCallback, useEffect, useState } from 'react'
import { constants, ethers } from 'ethers'
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
import clsx from 'clsx'
import { PictureUpload } from '@components/PictureUpload'
import { PrimaryButton } from '@components/buttons'
import { buttonVariants } from '@styles/classes'
import type { HandleSetImage } from '@pages/communities/[groupId]/edit'
import { isImageFile } from '@pages/communities/[groupId]/edit'
import type { Group } from '@/types/contract/ForumInterface'
import RemoveGroup from '@components/RemoveGroup'
import TagInput from '../TagInput/TagInput'
import { Card, CardContent } from '@/shad/ui/card'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { InputGroupName } from '@components/form/InputGroupName'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { groupSchema } from '@components/form/form.schema'
import { Form } from '@/shad/ui/form'
import { z } from 'zod'
import { Button } from '@/shad/ui/button'
import ImageUploader from '@components/form/ImageUploader'
import { InputGroupDescription } from '@components/form/InputGroupDescription'
import { BigNumberish } from '@semaphore-protocol/group'
import { hexToString } from 'viem'

interface EditGroupProps {
  group: Group
}

export function EditGroup({ group }: EditGroupProps) {
  const router = useRouter()
  const { address } = useAccount()
  const { t } = useTranslation()
  const {
    state: { isAdmin, isModerator },
  } = useCommunityContext()
  const handleUpdateStateAfterEdit = useFetchCommunitiesByIds(
    [Number(group.groupId)],
    false
  )

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [groupName, setGroupName] = useState<string>('')
  const [groupDescriptionState, setGroupDescriptionState] = useState<string>('')
  const [bannerFile, setBannerFile] = useState<File | undefined>(undefined)
  const [logoFile, setLogoFile] = useState<File | undefined>(undefined)
  const [confirmModal, setConfirmModal] = useState<boolean>(false)

  const [hasImageChanged, setHasImageChanged] = useState({
    banner: false,
    logo: false,
  })

  const [tags, setTags] = useState<string[]>([])

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
    if (group.groupDetails.tags) {
      setTags(
        group.groupDetails.tags.map(tag => ethers.utils.parseBytes32String(tag))
      )
    }
    setGroupName(group.name)
    setGroupDescriptionState(group?.groupDetails?.description)
  }, [])

  const handleSetImage = ({ file, imageType }: HandleSetImage): void => {
    if (file && isImageFile(file)) {
      setHasImageChanged(prev => ({ ...prev, [imageType]: true }))
    }
    const setImage = imageType === 'logo' ? setLogoFile : setBannerFile
    setImage(file as File)
  }

  const submitAllGroupDetails = useCallback(
    async data => {
      console.log('data', data)
      try {
        setIsSubmitting(true)
        const user = new Identity(address)
        const input = await createInputNote(user)
        const { a, b, c } = await generateGroth16Proof({ input })

        const images = {
          bannerFile: hasImageChanged.banner ? bannerFile : undefined,
          logoFile: hasImageChanged.logo ? logoFile : undefined,
        }

        const { bannerCID, logoCID } = await uploadImages(images)

        const mergedGroupDetails = {
          ...group.groupDetails,
          groupName,
          // add only if the value is not empty
          ...(groupDescriptionState && { description: groupDescriptionState }),
          bannerCID: bannerCID
            ? getBytes32FromIpfsHash(bannerCID)
            : constants.HashZero,
          logoCID: logoCID
            ? getBytes32FromIpfsHash(logoCID)
            : constants.HashZero,
          tags: tags.map(tag => {
            console.log('tag', tag, getBytes32FromString(tag))
            return getBytes32FromString(tag)
          }),
        }

        // Call the setGroupDescription function
        setGroupDetails(
          group.groupId as string,
          a,
          b,
          c,
          mergedGroupDetails,
          isAdmin || isModerator
        )
          .then(async () => {
            await handleUpdateStateAfterEdit()
            setIsSubmitting(false)
            setConfirmModal(false)
            await router.push(`/communities/${group.groupId}`)
          })
          .catch(error => {
            toast.error(`Something went wrong ${error.message}`)
            setIsSubmitting(false)
            setConfirmModal(false)
          })
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message)
        }
        setIsSubmitting(false)
        setConfirmModal(false)
      } finally {
        setIsSubmitting(false)
        setConfirmModal(false)
      }
    },
    [
      bannerFile,
      logoFile,
      group.id,
      // forumContract,
      tags,
      groupDescriptionState,
      groupName,
    ]
  )

  const previousPageUrl = router.query.previousPageUrl as string

  const form = useForm<z.infer<typeof groupSchema>>({
    resolver: zodResolver(groupSchema),
    values: {
      groupName: group.name,
      description: group.groupDetails.description,
      tags: group.groupDetails.tags,
      bannerFile: bannerFile,
      logoFile: logoFile,
    },
    defaultValues: {
      groupName: group.name,
      description: group.groupDetails.description,
      tags: group.groupDetails.tags,
      bannerFile: bannerFile,
      logoFile: logoFile,
    },
  })
  return (
    <div className="relative  z-50    max-w-screen-2xl ">
      <Form {...form}>
        <form
          className="space-y-12"
          onSubmit={form.handleSubmit(async data => {
            console.log('data', data)
            // await submitAllGroupDetails(data)
          })}
        >
          <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            {t('editCommunity')}
          </h1>

          <div className="flex w-full justify-between">
            <Link
              className="flex w-fit items-center gap-2 rounded border bg-primary px-4 py-2 text-primary-foreground"
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

          <InputGroupName form={form} />
          <InputGroupDescription form={form} />
          <div className="flex w-full flex-wrap justify-around">
            <ImageUploader
              form={form}
              name="bannerFile"
              initialImageUrl={
                group.groupDetails.bannerCID
                  ? `https://ipfs.io/ipfs/${group.groupDetails.bannerCID}`
                  : undefined
              }
            />
            <ImageUploader
              form={form}
              name="logoFile"
              initialImageUrl={
                group.groupDetails.logoCID
                  ? `https://ipfs.io/ipfs/${group.groupDetails.logoCID}`
                  : undefined
              }
            />
          </div>
          <TagInput form={form} />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  )
}

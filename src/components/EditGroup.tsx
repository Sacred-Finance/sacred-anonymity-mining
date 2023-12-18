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
import TagInput from './TagInput/TagInput'
import { Card, CardContent } from '@/shad/ui/card'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value)
  }

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setGroupDescriptionState(e.target.value)
  }

  const hideConfirmModal = () => {
    setConfirmModal(false)
  }

  const toggleConfirmModal = () => {
    setConfirmModal(!confirmModal)
  }
  const submitAllGroupDetails = useCallback(async () => {
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
        logoCID: logoCID ? getBytes32FromIpfsHash(logoCID) : constants.HashZero,
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
          toast.success('Group details updated')
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
  }, [
    bannerFile,
    logoFile,
    group.id,
    // forumContract,
    tags,
    groupDescriptionState,
    groupName,
  ])

  const previousPageUrl = router.query.previousPageUrl as string

  return (
    <div className="relative  z-50 grid  w-full max-w-screen-2xl grid-cols-1 gap-4 sm:p-8 md:p-24">
      <Link
        className="flex w-fit items-center gap-2 rounded border bg-primary p-2  text-primary-foreground"
        href={previousPageUrl ? previousPageUrl : `/communities/${group.id}`}
      >
        <ArrowLeftIcon className="h-6 w-6" />
        Back
      </Link>
      <div className="z-[-1] flex flex-col space-y-4 sm:col-span-full md:col-span-6 lg:col-span-6">
        <div className="flex flex-row items-center justify-between py-4">
          <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            {t('editCommunity')}
          </h1>
          <div>
            <RemoveGroup groupId={group.id} hidden={false} />
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <label className="text-lg text-gray-700 dark:text-gray-300">
            {t('placeholder.communityName')}
          </label>
          <input
            className="rounded border px-3 py-2 text-gray-700 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-blue-400"
            placeholder="An awesome community name"
            type="text"
            value={groupName}
            onChange={handleNameChange}
          />
        </div>

        <div className="flex flex-col space-y-4">
          <label className="text-lg text-gray-700 dark:text-gray-300">
            {t('placeholder.communityTags')}
          </label>
          <TagInput onChange={t => setTags(t)} selected={tags} />
        </div>

        <div className="flex flex-col space-y-4">
          <label className="text-lg text-gray-700 dark:text-gray-300">
            {t('placeholder.communityDescription')}
          </label>
          <textarea
            className="h-20 rounded border px-3 py-2 text-gray-700 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-blue-400"
            placeholder={t('placeholder.communityDescriptionContent') || ''}
            value={groupDescriptionState}
            onChange={handleDescriptionChange}
          />
        </div>

        <div className="flex gap-4 ">
          <PictureUpload
            uploadedImageUrl={
              bannerFile ? URL.createObjectURL(bannerFile) : undefined
            }
            displayName={t('banner')}
            name="banner"
            setImageFileState={handleSetImage}
          />

          <PictureUpload
            uploadedImageUrl={
              logoFile ? URL.createObjectURL(logoFile) : undefined
            }
            displayName={t('logo')}
            name="logo"
            setImageFileState={handleSetImage}
          />
        </div>

        <div className="flex flex-col justify-end space-x-0 py-2 md:flex-row md:space-x-2 md:py-4">
          <PrimaryButton
            className={clsx(
              buttonVariants.primarySolid,
              ' border bg-primary text-primary-foreground transition-colors hover:bg-blue-600 dark:hover:bg-blue-800'
            )}
            onClick={toggleConfirmModal}
          >
            {t('editCommunity')}
          </PrimaryButton>
        </div>
      </div>

      {confirmModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/80 transition-colors"></div>
          <Card className="relative z-20 mx-auto max-w-lg rounded-lg bg-card p-4 shadow-lg">
            <CardContent className="flex flex-col items-center space-y-4">
              <h2 className="text-xl font-semibold text-card-foreground">
                Confirm Your Changes
              </h2>
              <p>Are you sure you want to apply these changes?</p>
              <div className="flex w-full justify-around pt-4">
                <PrimaryButton
                  className="bg-red-400 hover:bg-red-500"
                  onClick={hideConfirmModal}
                  isLoading={isSubmitting}
                >
                  Cancel
                </PrimaryButton>
                <PrimaryButton
                  // disabled={isSubmitDisabled}
                  onClick={submitAllGroupDetails}
                  isLoading={isSubmitting}
                >
                  {t('button.confirm-edit')}
                </PrimaryButton>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

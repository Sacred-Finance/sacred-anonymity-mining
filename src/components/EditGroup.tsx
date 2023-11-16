import { useRouter } from 'next/router'
import { useAccount, useContract, useProvider } from 'wagmi'
import { useTranslation } from 'next-i18next'
import { ForumContractAddress } from '@/constant/const'
import ForumABI from '@/constant/abi/Forum.json'
import { useFetchCommunitiesByIds } from '@/hooks/useFetchCommunities'
import React, { useCallback, useEffect, useState } from 'react'
import { polygonMumbai } from 'wagmi/chains'
import { constants, ethers } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'
import { createInputNote, generateGroth16Proof, getBytes32FromIpfsHash, getBytes32FromString } from '@/lib/utils'
import { uploadImages } from '@/utils/communityUtils'
import { setGroupDetails } from '@/lib/api'
import { toast } from 'react-toastify'
import clsx from 'clsx'
import { PictureUpload } from '@components/PictureUpload'
import Link from 'next/link'
import { PrimaryButton } from '@components/buttons'
import { buttonVariants } from '@styles/classes'
import { HandleSetImage, isImageFile } from '@pages/communities/[groupId]/edit'
import { Group } from '@/types/contract/ForumInterface'
import RemoveGroup from '@components/RemoveGroup'
import DeleteItemButton from '@components/buttons/DeleteItemButton'
import { useValidatedImage } from '@components/CommunityCard/UseValidatedImage'
import TagInput from './TagInput/TagInput'
import { Card, CardContent } from '@/shad/ui/card'
import { useCommunityContext } from '@/contexts/CommunityProvider'

interface EditGroupProps {
  group: Group
}
export function EditGroup({ group }: EditGroupProps) {
  const router = useRouter()
  const { address } = useAccount()
  const {} = useProvider()
  const { t } = useTranslation()
  const {
    state: { isAdmin, isModerator },
  } = useCommunityContext()
  const handleUpdateStateAfterEdit = useFetchCommunitiesByIds([Number(group.groupId)], false)

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [groupName, setGroupName] = useState<string>('')
  const [groupDescriptionState, setGroupDescriptionState] = useState<string>('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [previewCard, setPreviewCard] = useState<boolean>(false)

  const [hasImageChanged, setHasImageChanged] = useState({
    banner: false,
    logo: false,
  })

  const [tags, setTags] = useState<string[]>([])

  // Define the provider and contract within a useEffect to avoid unnecessary re-renders
  const provider = useProvider({ chainId: polygonMumbai.id })
  const forumContract = useContract({
    address: ForumContractAddress,
    abi: ForumABI.abi,
    signerOrProvider: provider,
  }) as ethers.Contract

  // Helper function to fetch and handle the image
  const fetchImage = (imagePath: string, imageType: HandleSetImage['imageType']) => {
    fetch('https://ipfs.io/ipfs/' + imagePath)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], imageType, { type: blob.type })
        handleSetImage({ file, imageType })
      })
  }

  useEffect(() => {
    if (group.groupDetails.bannerCID) fetchImage(group.groupDetails.bannerCID, 'banner')
    if (group.groupDetails.logoCID) fetchImage(group.groupDetails.logoCID, 'logo')
    if (group.groupDetails.tags) setTags(group.groupDetails.tags.map(tag => ethers.utils.parseBytes32String(tag)))
    setGroupName(group.name)
    setGroupDescriptionState(group?.groupDetails?.description)
  }, [])

  const handleSetImage = ({ file, imageType }: HandleSetImage) => {
    if (file && isImageFile(file)) {
      setHasImageChanged(prev => ({ ...prev, [imageType]: true }))
    }
    const setImage = imageType === 'logo' ? setLogoFile : setBannerFile
    setImage(file)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGroupDescriptionState(e.target.value)
  }

  const hidePreview = () => {
    setPreviewCard(false)
  }

  const togglePreview = () => {
    setPreviewCard(!previewCard)
  }
  const submitAllGroupDetails = useCallback(async () => {
    try {
      setIsSubmitting(true)
      const user = new Identity(address as string)
      const input = await createInputNote(user)
      const { a, b, c } = await generateGroth16Proof(
        input,
        '/circuits/VerifyOwner__prod.wasm',
        '/circuits/VerifyOwner__prod.0.zkey'
      )
      let images = {
        bannerFile: hasImageChanged.banner ? bannerFile : null,
        logoFile: hasImageChanged.logo ? logoFile : null,
      }

      const { bannerCID, logoCID } = await uploadImages(images)

      const mergedGroupDetails = {
        ...group.groupDetails,
        groupName,
        // add only if the value is not empty
        ...(groupDescriptionState && { description: groupDescriptionState }),
        bannerCID: bannerCID ? getBytes32FromIpfsHash(bannerCID) : constants.HashZero,
        logoCID: logoCID ? getBytes32FromIpfsHash(logoCID) : constants.HashZero,
        tags: tags.map(tag => {
          console.log('tag', tag, getBytes32FromString(tag))
          return getBytes32FromString(tag)
        }),
      }
      console.log('mergedGroupDetails', mergedGroupDetails)

      // Call the setGroupDescription function
      setGroupDetails(group.groupId as string, a, b, c, mergedGroupDetails, isAdmin || isModerator)
        .then(async response => {
          await handleUpdateStateAfterEdit()
          toast.success('Group details updated')
          setIsSubmitting(false)
          setPreviewCard(false)
          router.push(`/communities/${group.groupId}`)
        })
        .catch(error => {
          console.log(error) // log the error or handle it as you need

          toast.error(`Something went wrong ${error.message}`)
          setIsSubmitting(false)
          setPreviewCard(false)
        })
    } catch (error) {
      // todo: handle better
      toast.error(error.message)
      setIsSubmitting(false)
      setPreviewCard(false)
    } finally {
      setIsSubmitting(false)
      setPreviewCard(false)
    }
  }, [bannerFile, logoFile, group.id, forumContract, tags, groupDescriptionState, groupName])

  return (
    <div className={clsx('relative  z-50 grid  w-full max-w-screen-2xl grid-cols-1 gap-4 sm:p-8 md:p-24')}>
      <div className="-z-[1] flex flex-col space-y-4 sm:col-span-full md:col-span-6 lg:col-span-6">
        <div className="flex flex-row items-center justify-between py-4">
          <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{t('editCommunity')}</h1>
          <div>
            <RemoveGroup groupId={group.id} hidden={false} />
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <label className="text-lg text-gray-700 dark:text-gray-300">{t('placeholder.communityName')}</label>
          <input
            className="rounded border px-3 py-2 text-gray-700 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-blue-400"
            placeholder={'An awesome community name'}
            type="text"
            value={groupName}
            onChange={handleNameChange}
          />
        </div>

        <div className="flex flex-col space-y-4">
          <label className="text-lg text-gray-700 dark:text-gray-300">{t('placeholder.communityTags')}</label>
          <TagInput onChange={t => setTags(t)} selected={tags} />
        </div>

        <div className="flex flex-col space-y-4">
          <label className="text-lg text-gray-700 dark:text-gray-300">{t('placeholder.communityDescription')}</label>
          <textarea
            className="h-20 rounded border px-3 py-2 text-gray-700 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-blue-400"
            placeholder={t('placeholder.communityDescriptionContent') || ''}
            value={groupDescriptionState}
            onChange={handleDescriptionChange}
          />
        </div>

        <div className="flex gap-4 ">
          <PictureUpload
              uploadedImageUrl={bannerFile ? URL.createObjectURL(bannerFile) : null}
            displayName={t('banner')}
            name={'banner'}
            setImageFileState={handleSetImage}
          />

          <PictureUpload
              uploadedImageUrl={logoFile ? URL.createObjectURL(logoFile) : null}
            displayName={t('logo')}
            name={'logo'}
            setImageFileState={handleSetImage}
          />
        </div>

        <div className="flex flex-col justify-between space-x-0 py-2 md:flex-row md:space-x-2 md:py-4">
          <Link
            href="/"
            className="rounded border-2 border-red-400 p-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white dark:border-red-600 dark:text-red-400 dark:hover:bg-red-600 md:px-4"
          >
            Back
          </Link>

          <DeleteItemButton isAdminOrModerator={true} groupId={group.id} itemId={group.id} itemType={'group'} />

          <PrimaryButton
            className={clsx(
              buttonVariants.primarySolid,
              ' border bg-primary text-primary-foreground transition-colors hover:bg-blue-600 dark:hover:bg-blue-800'
            )}
            onClick={togglePreview}
          >
            {t('preview')}
          </PrimaryButton>
        </div>
      </div>

      {previewCard && (
        <div className="fixed inset-0 z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/80 transition-colors"></div>
          <Card className="relative z-20 mx-auto max-w-lg rounded-lg bg-card p-4 shadow-lg">
            <CardContent className="flex flex-col items-center space-y-4">
              <h2 className="text-xl font-semibold text-card-foreground">Confirm Your Changes</h2>
              <p>Are you sure you want to apply these changes?</p>
              <div className="flex w-full justify-around pt-4">
                <PrimaryButton className="bg-red-400 hover:bg-red-500" onClick={hidePreview} isLoading={isSubmitting}>
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

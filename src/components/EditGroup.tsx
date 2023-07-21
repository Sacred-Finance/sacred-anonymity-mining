import { useRouter } from 'next/router'
import { useAccount, useContract, useContractWrite, usePrepareContractWrite, useProvider, useSigner } from 'wagmi'
import { useTranslation } from 'next-i18next'
import { ForumContractAddress } from '@/constant/const'
import ForumABI from '@/constant/abi/Forum.json'
import { useFetchCommunitiesByIds } from '@/hooks/useFetchCommunities'
import React, { useCallback, useEffect, useState } from 'react'
import { polygonMumbai } from 'wagmi/chains'
import { ethers } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'
import { createInputNote, generateGroth16Proof } from '@/lib/utils'
import { uploadImages } from '@/utils/communityUtils'
import { setGroupDetails } from '@/lib/api'
import { toast } from 'react-toastify'
import clsx from 'clsx'
import { PictureUpload } from '@components/PictureUpload'
import Link from 'next/link'
import { PrimaryButton } from '@components/buttons'
import { buttonVariants } from '@styles/classes'
import { CommunityContext } from '@components/CommunityCard/CommunityCard'
import { CommunityCardHeader } from '@components/CommunityCard/CommunityCardHeader'
import { CommunityCardBody } from '@components/CommunityCard/CommunityCardBody'
import { HandleSetImage, isImageFile } from '@pages/communities/[groupId]/edit'
import { Group } from '@/types/contract/ForumInterface'
import { JsonRpcProvider } from '@ethersproject/providers'
import RemoveGroup from '@components/RemoveGroup'
import { useRemoveGroup } from '@/hooks/useRemoveGroup'
import { CommunityId } from '@/contexts/CommunityProvider'

interface EditGroupProps {
  group: Group
  isAdmin: boolean
}
export function EditGroup({ group, isAdmin }: EditGroupProps) {
  const router = useRouter()
  const { address } = useAccount()
  const {} = useProvider()
  const { t } = useTranslation()

  const { data: signer } = useSigner()

  const { write } = useRemoveGroup(group.groupId as CommunityId)

  const handleUpdateStateAfterEdit = useFetchCommunitiesByIds([Number(group.groupId)], false)

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [groupName, setGroupName] = useState<string>('')
  const [groupDescriptionState, setGroupDescriptionState] = useState<string>('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [previewCard, setPreviewCard] = useState<boolean>(false)

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

  // The useEffect that handles the initial setup
  useEffect(() => {
    if (group.groupDetails.bannerCID) fetchImage(group.groupDetails.bannerCID, 'banner')
    if (group.groupDetails.logoCID) fetchImage(group.groupDetails.logoCID, 'logo')
    setGroupName(group.name)
    setGroupDescriptionState(group?.groupDetails?.description)
  }, [])

  const handleSetImage = ({ file, imageType }: HandleSetImage) => {
    let newImage = ''
    if (file && isImageFile(file)) {
      newImage = URL.createObjectURL(file)
    }
    const setImage = imageType === 'logo' ? setLogoFile : setBannerFile
    setImage(file)

    const setUrl = imageType === 'logo' ? setLogoUrl : setBannerUrl
    setUrl(newImage)
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

      const { bannerCID, logoCID } = await uploadImages({ bannerFile, logoFile })

      const mergedGroupDetails = {
        ...group.groupDetails,
        // add only if the value is not empty
        ...(groupDescriptionState && { description: groupDescriptionState }),
        ...(bannerCID && { banner: bannerCID }),
        ...(logoCID && { logo: logoCID }),
      }

      // Call the setGroupDescription function
      setGroupDetails(group.groupId as string, a, b, c, mergedGroupDetails)
        .then(async response => {
          await handleUpdateStateAfterEdit()
          toast.success('Group details updated')
          router.push(`/communities/${group.groupId}`)
        })
        .catch(error => {
          console.log(error) // log the error or handle it as you need
        })
    } catch (error) {
      // todo: handle better
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }, [bannerFile, logoFile, group.id, forumContract, groupDescriptionState, groupName])

  return (
    <div
      className={clsx('relative mx-auto mb-64 grid h-screen w-full max-w-screen-2xl  grid-cols-1 gap-8 sm:p-8 md:p-24')}
    >
      <div className="flex flex-col space-y-4 sm:col-span-full md:col-span-6 lg:col-span-6">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-semibold text-gray-700">{t('editCommunity')}</h1>
        </div>

        <div className="flex flex-col space-y-4">
          <label className="text-lg text-gray-700">{t('placeholder.communityName')}</label>
          <input
            className="rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none"
            placeholder={'An awesome community name'}
            type="text"
            value={groupName}
            onChange={handleNameChange}
          />
        </div>

        <div className="flex flex-col space-y-4">
          <label className="text-lg text-gray-700">{t('placeholder.communityDescription')}</label>
          <textarea
            className="h-20 rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none"
            placeholder={t('placeholder.communityDescriptionContent') || ''}
            value={groupDescriptionState}
            onChange={handleDescriptionChange}
          />
        </div>

        <div className="flex gap-3 ">
          <PictureUpload
            uploadedImageUrl={bannerUrl}
            displayName={t('banner')}
            name={'banner'}
            setImageFileState={handleSetImage}
          />

          <PictureUpload
            uploadedImageUrl={logoUrl}
            displayName={t('logo')}
            name={'logo'}
            setImageFileState={handleSetImage}
          />
        </div>

        <div className={'flex flex-col justify-between space-x-0 py-2 md:flex-row md:space-x-2 md:py-4'}>
          <Link
            href="/"
            className="mb-2 rounded-lg border-2 border-red-400 p-2 text-red-500 hover:bg-red-500 hover:text-white md:mb-0 md:px-4"
          >
            Back
          </Link>

          <PrimaryButton
            className={clsx(buttonVariants.primarySolid, ' border')}
            // disabled={isSubmitDisabled}
            onClick={togglePreview}
          >
            {t('preview')}
          </PrimaryButton>
        </div>
      </div>

      {previewCard && <div className="fixed inset-0 m-0 h-screen w-screen bg-gray-900/60 " />}
      {previewCard && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 rounded-b rounded-t-full bg-gradient-to-t from-lightBlue-950">
          <h1 className="text-[40px] text-white">Double check your changes!</h1>
          <div className="flex w-3/4 justify-evenly gap-64">
            <CommunityContext.Provider value={group}>
              <div className="w-1/2 shadow-2xl ">
                <h4 className="text-[20px] text-white">Before</h4>

                <CommunityCardHeader />
                <CommunityCardBody />
              </div>
            </CommunityContext.Provider>

            <CommunityContext.Provider
              value={{
                ...group,
                groupDetails: {
                  ...group?.groupDetails,
                  logo: logoUrl,
                  banner: bannerUrl,
                  description: groupDescriptionState,
                },
              }}
            >
              <div className="w-1/2 shadow-2xl">
                <h4 className="text-[20px] text-white">After</h4>

                <CommunityCardHeader
                  srcBannerOverride={bannerUrl || undefined}
                  srcLogoOverride={logoUrl || undefined}
                />
                <CommunityCardBody />
              </div>
            </CommunityContext.Provider>
          </div>
          <div className="flex w-3/4 justify-between">
            <button
              onClick={hidePreview}
              className="mb-2 rounded-lg bg-red-400 p-2 text-white hover:bg-red-500 md:mb-0 md:px-4"
            >
              Cancel
            </button>
            <PrimaryButton
              className={clsx(buttonVariants.solid, 'z-50 border px-4')}
              // disabled={isSubmitDisabled}
              onClick={submitAllGroupDetails}
              isLoading={isSubmitting}
            >
              {t('button.confirm-edit')}
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* clarify what admins can do */}
      {isAdmin && (
        <div className="flex flex-col space-y-4 sm:col-span-full md:col-span-6 lg:col-span-6">
          <div className="flex flex-col space-y-4">
            <label className="text-lg text-gray-700">Delete Community</label>
            <RemoveGroup onClick={() => write?.({ recklesslySetUnpreparedArgs: [group.id] })} hidden={false} />
          </div>
        </div>
      )}
    </div>
  )
}

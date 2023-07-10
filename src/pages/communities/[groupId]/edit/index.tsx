import React, { useCallback, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { ForumContractAddress } from '../../../../constant/const'
import { useAccount, useContract, useProvider } from 'wagmi'
import { PrimaryButton } from '@components/buttons'
import { useTranslation } from 'next-i18next'
import { polygonMumbai } from 'wagmi/chains'
import { PictureUpload } from '@components/PictureUpload'
import clsx from 'clsx'
import { buttonVariants } from '@styles/classes'
import { useCreateCommunity } from '@/hooks/useCreateCommunity'
import Header from '@components/Header'
import { Breadcrumbs } from '@components/Breadcrumbs'
import Footer from '@components/Footer'
import Link from 'next/link'
import { useCommunityById } from '@/contexts/CommunityProvider'
import { useRouter } from 'next/router'
import { Group } from '@/types/contract/ForumInterface'
import { uploadImages } from '@/utils/communityUtils'
import ForumABI from '@/constant/abi/Forum.json'
import { User } from '@/lib/model'
import { Identity } from '@semaphore-protocol/identity'
import { createInputNote, generateGroth16Proof, getBytes32FromIpfsHash } from '@/lib/utils'
import { setGroupBanner, setGroupDetails, setGroupLogo } from '@/lib/api'
import { useFetchCommunitiesByIds } from '@/hooks/useFetchCommunities'
import { CommunityCardHeader } from '@components/CommunityCard/CommunityCardHeader'
import { CommunityContext } from '@components/CommunityCard/CommunityCard'
import { CommunityCardBody } from '@components/CommunityCard/CommunityCardBody'

function RemoveIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="m-auto h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
    </svg>
  )
}

function EditGroup({ onEdit, group }: { onEdit: any; group: Group }) {
  const { address } = useAccount()
  const handleUpdateStateAfterEdit = useFetchCommunitiesByIds([Number(group.groupId)], false)

  const { t } = useTranslation()

  const [groupName, setGroupName] = useState('')
  const [groupDescriptionState, setGroupDescriptionState] = useState('')
  const [bannerFile, setBannerFile] = useState<string>()
  const [logoFile, setLogoFile] = useState<string>()

  useEffect(() => {
    if (group.banner) {
      fetch('https://ipfs.io/ipfs/' + group.banner)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'banner', { type: blob.type })
          handleSetBanner(file)
        })
    }

    if (group.logo) {
      fetch('https://ipfs.io/ipfs/' + group.logo)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'logo', { type: blob.type })
          handleSetLogo(file)
        })
    }

    setGroupName(group.name)
    setGroupDescriptionState(group?.groupDetails?.description)
  }, [])
  const handleSetBanner = (file: File) => {
    if (isImageFile(file) && file) {
      const newBanner = file && isImageFile(file) ? URL.createObjectURL(file) : ''
      setBannerFile(newBanner)
    } else {
      setBannerFile('')
    }
  }

  const handleSetLogo = (file: File) => {
    if (isImageFile(file) && file) {
      const newLogo = file && isImageFile(file) ? URL.createObjectURL(file) : ''
      setLogoFile(newLogo)
    } else {
      setLogoFile('')
    }
  }

  const handleNameChange = e => {
    setGroupName(e.target.value)
  }
  const handleDescriptionChange = e => {
    console.log(e.target.value)
    setGroupDescriptionState(e.target.value)
  }
  const provider = useProvider({ chainId: polygonMumbai.id })
  const forumContract = useContract({
    address: ForumContractAddress,
    abi: ForumABI.abi,
    signerOrProvider: provider,
  }) as ethers.Contract

  // const submitGroupDescription = useCallback(async () => {
  //   try {
  //     const user = new Identity(address as string)
  //     const input = await createInputNote(user)
  //     const { a, b, c } = await generateGroth16Proof(
  //       input,
  //       '/circuits/VerifyOwner__prod.wasm',
  //       '/circuits/VerifyOwner__prod.0.zkey'
  //     )
  //
  //     // Call the setGroupDescription function
  //     setGroupDescription(group.groupId as string, a, b, c, groupDescriptionState)
  //       .then(async response => {
  //         console.log(response) // log the response or do whatever you want with it
  //       })
  //       .catch(error => {
  //         console.log(error) // log the error or handle it as you need
  //       })
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }, [groupDescriptionState])

  const submitBanner = useCallback(async () => {
    try {
      const user = new Identity(address as string)
      const input = await createInputNote(user)
      const { a, b, c } = await generateGroth16Proof(
        input,
        '/circuits/VerifyOwner__prod.wasm',
        '/circuits/VerifyOwner__prod.0.zkey'
      )

      const { bannerCID } = await uploadImages({ bannerFile })

      if (!bannerCID) return

      // Call the setGroupDescription function
      setGroupBanner(group.groupId as string, a, b, c, getBytes32FromIpfsHash(bannerCID))
        .then(async response => {
          console.log(response) // log the response or do whatever you want with it
        })
        .catch(error => {
          console.log(error) // log the error or handle it as you need
        })
    } catch (error) {
      console.log(error)
    }
  }, [bannerFile, groupDescriptionState])

  const submitLogo = useCallback(async () => {
    try {
      const user = new Identity(address as string)
      const input = await createInputNote(user)
      const { a, b, c } = await generateGroth16Proof(
        input,
        '/circuits/VerifyOwner__prod.wasm',
        '/circuits/VerifyOwner__prod.0.zkey'
      )

      const { logoCID } = await uploadImages({ logoFile })

      if (!logoCID) return

      // Call the setGroupDescription function
      setGroupLogo(group.groupId as string, a, b, c, logoCID)
        .then(async response => {
          console.log(response) // log the response or do whatever you want with it
        })
        .catch(error => {
          console.log(error) // log the error or handle it as you need
        })
    } catch (error) {
      console.log(error)
    }
  }, [logoFile, groupDescriptionState])

  const submitAllGroupDetails = useCallback(async () => {
    console.log('submitAllGroupDetails', groupDescriptionState, groupName, bannerFile, logoFile)
    try {
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
        })
        .catch(error => {
          console.log(error) // log the error or handle it as you need
        })
    } catch (error) {
      console.log(error)
    }
  }, [bannerFile, logoFile, group.id, forumContract, groupDescriptionState, groupName])

  function isImageFile(file) {
    return file && file.type.startsWith('image/')
  }

  async function editGroupDetails(
    groupDetails: any, // The structure of groupDetails depends on your application
    address: string,
    groupId: string,
    users: User[], // List of group members or admins
    setWaiting: Function
  ) {
    try {
      const user = new Identity(address as string)
      const input = await createInputNote(user)
      const { a, b, c } = await generateGroth16Proof(
        input,
        '/circuits/VerifyOwner__prod.wasm',
        '/circuits/VerifyOwner__prod.0.zkey'
      )
      return setGroupDetails(group.groupId as string, a, b, c, group.groupDetails).then(async data => {
        await this.cacheUpdatedGroupDetails(groupId, groupDetails, setWaiting) // we update redis with a new 'temp' details here
        return data
      })
    } catch (error) {
      throw error
    }
  }

  const [previewCard, setPreviewCard] = useState<boolean>(false)
  const showPreview = () => {
    setPreviewCard(true)
  }
  const hidePreview = () => {
    setPreviewCard(false)
  }
  const togglePreview = () => {
    setPreviewCard(!previewCard)
  }
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
            uploadedImageUrl={bannerFile}
            displayName={t('banner')}
            name={'banner'}
            setImageFileState={handleSetBanner}
          />

          <PictureUpload
            uploadedImageUrl={logoFile}
            displayName={t('logo')}
            name={'logo'}
            setImageFileState={handleSetLogo}
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
          <h1 className="text-[40px] text-white">Comparing Before and After</h1>
          <div className="flex w-3/4 justify-evenly gap-64">
            <CommunityContext.Provider value={group}>
              <div className="w-1/2 shadow-2xl ring-emerald-500  ring-offset-8  ring-offset-transparent hover:ring-2">
                <CommunityCardHeader />
                <CommunityCardBody />
              </div>
            </CommunityContext.Provider>

            <CommunityContext.Provider
              value={{
                ...group,
                groupDetails: {
                  ...group?.groupDetails,
                  logo: logoFile,
                  banner: bannerFile,
                  description: groupDescriptionState,
                },
              }}
            >
              <div className="w-1/2 shadow-2xl ring-emerald-500  ring-offset-8  ring-offset-transparent hover:ring-2">
                <CommunityCardHeader
                  srcBannerOverride={bannerFile || undefined}
                  srcLogoOverride={logoFile || undefined}
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
              className={clsx(buttonVariants.solid, 'z-50 w-16 border')}
              // disabled={isSubmitDisabled}
              onClick={submitAllGroupDetails}
            >
              {t('button.edit')}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CreateGroupForm() {
  const createCommunity = useCreateCommunity(() => {})
  const router = useRouter()
  const { groupId } = router.query
  const community = useCommunityById(groupId as string)

  if (!community) return
  return (
    <div className={'relative flex h-screen flex-col'}>
      <Header />
      <Breadcrumbs />
      <EditGroup onEdit={createCommunity} group={community} />
      <div className={'flex-1'} />
      <Footer />
    </div>
  )
}

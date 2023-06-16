import React, { useEffect, useMemo, useState } from 'react'
import { ToolTip } from './HOC/ToolTip'
import { useTranslation } from 'next-i18next'
import { uploadAndCacheImages } from '../utils/communityUtils'
import { useIdentity } from '../hooks/useIdentity'
import { useFetchCommunities } from '../hooks/useFetchCommunities'
import { PictureUpload } from './PictureUpload'

function EditGroupModal({ community, hidden = false }) {
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false)
  const fetchCommunities = useFetchCommunities(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (!isEditGroupOpen) return
    if (community.banner) {
      fetch('https://ipfs.io/ipfs/' + community.banner)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'banner', { type: blob.type })
          setBannerFile(file)
        })
    }

    if (community.logo) {
      fetch('https://ipfs.io/ipfs/' + community.logo)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'logo', { type: blob.type })
          setLogoFile(file)
        })
    }
  }, [isEditGroupOpen])

  const identity = useIdentity()

  const isOwner = useMemo(() => {
    return community.ownerIdentity === identity
  }, [community?.ownerIdentity, identity])

  const handleImageUpload = e => {
    const file = e.target.files[0]
    if (e.target.name === 'banner') {
      setBannerFile(file)
    } else {
      setLogoFile(file)
    }
  }

  const submit = async () => {
    await uploadAndCacheImages({
      bannerFile,
      logoFile,
      groupId: community.groupId,
    })
    await fetchCommunities()
    setIsEditGroupOpen(false)
  }

  const isSubmitDisabled = !bannerFile && !logoFile

  const { logoUrl, bannerUrl } = useMemo(() => {
    return {
      logoUrl: logoFile ? URL.createObjectURL(logoFile) : '',
      bannerUrl: bannerFile ? URL.createObjectURL(bannerFile) : '',
    }
  }, [logoFile, bannerFile])

  if (hidden) return null
  return (
    <>
      <ToolTip
        type="primary"
        title={t('toolTip.editCommunity.title')}
        message={t('toolTip.editCommunity.message') || ''}
      >
        <button
          id="edit-community-button"
          className={`absolute right-0 mt-2 mr-2 rounded-full bg-gray-100 p-2 transition duration-300 hover:bg-purple-600 hover:text-white ${
            !isOwner || hidden ? 'hidden' : ''
          }`}
          onClick={() => setIsEditGroupOpen(true)}
          aria-label="edit community"
        >
          edit{' '}
        </button>
      </ToolTip>

      {isEditGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="relative rounded-lg bg-white">
              <div className="flex items-center justify-between rounded-t-lg bg-purple-500 p-4">
                <h2 className="text-white">Edit Community Content</h2>
                <button
                  className="rounded-full bg-gray-200 p-2 transition duration-300 hover:bg-gray-300"
                  onClick={() => setIsEditGroupOpen(false)}
                  aria-label="close"
                >
                  +
                </button>
              </div>
              <div className="p-4">
                <div className="flex flex-col space-y-4">
                  <PictureUpload
                    uploadedImageUrl={bannerUrl}
                    displayName={t('banner')}
                    name="banner"
                    setImageFileState={setBannerFile}
                  />

                  <PictureUpload
                    uploadedImageUrl={logoUrl}
                    displayName={t('logo')}
                    name="logo"
                    setImageFileState={setLogoFile}
                  />
                </div>
              </div>
              <hr className="border-gray-200" />
              <div className="flex items-center justify-end rounded-b-lg bg-gray-100 p-4">
                <button
                  className="mr-3 rounded-md bg-purple-500 px-4 py-2 font-medium text-white hover:bg-primary-600 focus:border-primary-400 focus:outline-none focus:ring-primary-400"
                  disabled={isSubmitDisabled}
                  onClick={submit}
                >
                  {t('button.upload')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EditGroupModal

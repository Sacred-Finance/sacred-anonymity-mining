import React, { useState } from 'react'
import { utils } from 'ethers'
import {
  chainLogos,
  supportedChains,
  supportedChainsArray,
} from '@/constant/const'
import { FieldArray, FormikProvider, useFormik } from 'formik'
import type { Chain } from 'wagmi'
import { PrimaryButton } from '@components/buttons'
import { useTranslation } from 'next-i18next'
import { polygonMumbai } from 'wagmi/chains'
import { PictureUpload } from '@components/PictureUpload'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import type { ICreateCommunityArgs } from '@/hooks/useCreateCommunity'
import { useCreateCommunity } from '@/hooks/useCreateCommunity'
import Link from 'next/link'
import Dropdown from '@/components/buttons/Dropdown/Dropdown'
import TagInput from '@/components/TagInput/TagInput'
import SelectToken from '@/components/SelectToken/SelectToken'
import Head from 'next/head'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/shad/ui/hover-card'
import { Button } from '@/shad/ui/button'
import { FaCircleInfo } from 'react-icons/fa6'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/router'

export interface HandleSetImage {
  file: File | undefined
  imageType: 'logo' | 'banner'
}
function RemoveIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18 12H6"
      />
    </svg>
  )
}

interface OnTokenSelectParams {
  index: number
  tokenAddress: string
  symbol: string
  decimals: number
}

function CreateGroupFormUI({
  onCreate,
}: {
  onCreate: (params: ICreateCommunityArgs) => Promise<void>
}) {
  const router = useRouter()
  const { t } = useTranslation()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialValues = {
    tokenAddress: '',
    minAmount: 0,
    token: '',
    decimals: 0,
  }
  const formik = useFormik({
    initialValues: {
      tokenRequirements: [initialValues],
    },
    onSubmit: values => {
      alert(JSON.stringify(values, null, 2))
    },
  })
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [reqMandatory, setReqMandatory] = useState(true)

  const [bannerFile, setBannerFile] = useState<File | undefined>(undefined)
  const [logoFile, setLogoFile] = useState<File | undefined>(undefined)

  const [bannerUrl, setBannerUrl] = useState<string | undefined>(undefined)
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined)

  const [tags, setTags] = useState<string[]>([])

  const handleNameChange = (e: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setGroupName(e.target.value)
  }
  const handleDescriptionChange = (e: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setGroupDescription(e.target.value)
  }

  const handleSetImage = ({ file, imageType }: HandleSetImage) => {
    const setImage = imageType === 'logo' ? setLogoFile : setBannerFile
    const setUrl = imageType === 'logo' ? setLogoUrl : setBannerUrl
    setImage(file)
    setUrl(file ? URL.createObjectURL(file) : '')
  }

  const [selectedChain, setSelectedChain] = useState<Chain>(
    supportedChains[polygonMumbai.id]
  )

  const onTokenSelect = ({
    index,
    tokenAddress,
    symbol,
    decimals,
  }: OnTokenSelectParams) => {
    formik.setFieldValue(
      `tokenRequirements.${index}.tokenAddress`,
      tokenAddress
    )
    formik.setFieldValue(`tokenRequirements.${index}.token`, symbol)
    formik.setFieldValue(`tokenRequirements.${index}.decimals`, decimals)
  }

  const addReq = () => {
    if (!reqMandatory) {
      setReqMandatory(true)
    }
    formik.setFieldValue('tokenRequirements', [
      ...formik.values.tokenRequirements,
      initialValues,
    ])
  }

  const submit = async () => {
    setIsSubmitting(true)
    const tokenRequirements = formik.values.tokenRequirements.map(v => {
      return {
        ...v,
        minAmount: BigInt(v?.minAmount * 10 ** v?.decimals).toString(),
        // maxAmount: BigInt(v?.maxAmount * 10 ** v?.decimals).toString(),
      }
    })
    await onCreate({
      name: groupName,
      requirements: reqMandatory ? tokenRequirements : [],
      bannerFile: bannerFile,
      logoFile: logoFile,
      chainId: reqMandatory ? selectedChain.id : polygonMumbai.id,
      tags: tags,
      description: groupDescription,
      note: BigInt(0).toString(),
    })
    setIsSubmitting(false)
    router.push('/')
  }

  const selectChain = async (c: Chain) => {
    setSelectedChain(c)
    await formik.setFieldValue('tokenRequirements', [], false)
  }

  const isSubmitDisabled =
    isSubmitting ||
    !groupName ||
    (reqMandatory &&
      (!formik.isValid ||
        formik.values.tokenRequirements.every(
          r =>
            isNaN(r.minAmount) ||
            !utils.isAddress(r.tokenAddress) ||
            !r?.token ||
            isNaN(r.decimals)
        )))

  return (
    <div>
      <Head>
        <title>Create Group</title>
        <meta
          property="og:title"
          content="Create Group | Sacred Logos"
          key="title"
        />
        <meta property="og:url" content={location.href} />
      </Head>
      <div
        className={clsx(
          'text-primary-600 w-full max-w-screen-xl space-y-6 rounded-lg p-2 shadow dark:bg-gray-900 dark:text-gray-200 md:p-12 '
        )}
      >
        <Link
          className="flex w-fit items-center gap-2 rounded border bg-primary p-2 text-primary-foreground  hover:bg-primary/50"
          href="/"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back
        </Link>

        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-semibold">{t('createCommunity')}</h1>
        </div>

        <div className="flex flex-col space-y-4">
          <label className="text-lg ">{t('placeholder.communityName')}</label>
          <input
            className="form-input rounded border border-gray-400 px-3 py-2 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700"
            placeholder="An awesome community name"
            type="text"
            value={groupName}
            onChange={handleNameChange}
          />
        </div>
        <div className="flex flex-col space-y-4">
          <label className="text-lg">{t('placeholder.communityTags')}</label>
          <TagInput onChange={t => setTags(t)} selected={tags} />
          <div className="flex flex-col space-y-4">
            <label className="text-lg ">
              {t('placeholder.communityDescription')}
            </label>
            <textarea
              className="h-20 rounded border border-gray-400 px-3 py-2 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              placeholder={t('placeholder.communityDescriptionContent') || ''}
              value={groupDescription}
              onChange={handleDescriptionChange}
            />
          </div>

          <div className="flex items-start gap-4 dark:text-primary ">
            <PictureUpload
              uploadedImageUrl={bannerUrl}
              displayName={t('banner')}
              name="banner"
              setImageFileState={handleSetImage}
            />
            <PictureUpload
              uploadedImageUrl={logoUrl}
              displayName={t('logo')}
              name="logo"
              setImageFileState={handleSetImage}
            />
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <HoverCard openDelay={500} closeDelay={250}>
                <HoverCardTrigger asChild>
                  <Button
                    variant="outline"
                    className=" flex items-center justify-center rounded p-3 text-xs"
                  >
                    <FaCircleInfo className="h-4 w-4 shrink-0" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="pointer-events-auto max-h-96 w-96 overflow-y-auto ">
                  <div className="space-y-1">
                    <span className="max-h-72 text-muted-foreground">
                      {t('toolTip.tokenGating.title')}
                      <hr className="mb-2 mt-1" />
                      {t('toolTip.tokenGating.message') || ''}
                    </span>
                  </div>
                </HoverCardContent>
              </HoverCard>

              <input
                type="checkbox"
                id="isChecked"
                className="h-6 w-6 rounded border-2 border-primary text-primary focus:ring-0"
                checked={reqMandatory}
                onChange={e => {
                  setReqMandatory(e.target.checked)
                  if (!e.target.checked) {
                    formik.setFieldValue('tokenRequirements', [])
                  } else {
                    formik.setFieldValue('tokenRequirements', [initialValues])
                  }
                }}
              />
            </div>

            <div className="relative inline-flex w-[300px] items-center gap-4">
              <div className="group relative w-60">
                <Dropdown
                  options={supportedChainsArray.map(c => ({
                    key: c.name,
                    value: c,
                    image: chainLogos[c.id],
                  }))}
                  selected={{
                    key: selectedChain.name,
                    value: selectedChain,
                    image: chainLogos[selectedChain.id],
                  }}
                  onSelect={v => {
                    selectChain(v)
                    formik.setFieldValue('tokenRequirements', [initialValues])
                    if (!reqMandatory) {
                      setReqMandatory(true)
                    }
                  }}
                  disabled={!reqMandatory}
                />
              </div>

              <button
                className={clsx(
                  'flex h-10 w-10 items-center justify-center border p-3 text-xl'
                )}
                onClick={addReq}
              >
                +
              </button>
            </div>
          </div>
          <hr className="" />
          <FormikProvider value={formik}>
            <AnimatePresence>
              <motion.form onSubmit={submit}>
                {formik.values.tokenRequirements.length === 0 && (
                  <div className="flex flex-col items-center justify-center space-y-4 rounded border border-gray-200 bg-gray-100 p-4 dark:bg-gray-900">
                    <p className="text-sm font-semibold ">
                      {t('placeholder.noTokenRequirements')}
                    </p>
                  </div>
                )}

                <FieldArray
                  name="tokenRequirements"
                  render={({ remove }) => (
                    <div className="flex flex-col justify-center space-y-4 pb-2">
                      {formik.values.tokenRequirements.map((r, i, arr) => (
                        <motion.div
                          key={i}
                          layout
                          className="flex h-full items-center space-x-4"
                          initial={{ opacity: 0, y: 20, overflowY: 'visible' }}
                          animate={{ opacity: 1, y: 0, overflowY: 'hidden' }}
                          exit={{ opacity: 0, y: 20, overflowY: 'hidden' }}
                          transition={{ duration: 0.5 }}
                        >
                          <p className="font-bold ">{i + 1}.</p>
                          <div className="flex w-[400px]">
                            <SelectToken
                              chainId={selectedChain.id}
                              selectedToken={r?.token}
                              onTokenSelect={(address, symbol, decimals) =>
                                onTokenSelect({
                                  index: i,
                                  tokenAddress: address,
                                  symbol: symbol,
                                  decimals: decimals,
                                })
                              }
                            />
                          </div>

                          <div className="w-32">
                            <input
                              disabled={!reqMandatory}
                              className="h-10 w-full rounded border border-gray-400 px-3 py-2 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                              type="number"
                              min={0}
                              defaultValue={r.minAmount}
                              value={r.minAmount}
                              onChange={formik.handleChange}
                              name={`tokenRequirements.${i}.minAmount`}
                              placeholder={t('placeholder.minAmount') as string}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (arr.length > 1) {
                                remove(i)
                              } else {
                                setReqMandatory(false)
                                remove(i)
                              }
                            }}
                            className="flex  items-center justify-center rounded border border-red-500 text-red-500 transition-colors hover:bg-red-500 hover:text-white focus:outline-none"
                          >
                            <RemoveIcon />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                />
              </motion.form>
            </AnimatePresence>
          </FormikProvider>
          <div className="flex flex-col justify-end space-x-0 py-2 md:flex-row md:space-x-2 md:py-4">
            <PrimaryButton
              disabled={isSubmitDisabled || isSubmitting}
              onClick={submit}
              isLoading={isSubmitting}
            >
              {t('button.create')}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateGroupForm() {
  const createCommunity = useCreateCommunity(() => {})
  return <CreateGroupFormUI onCreate={createCommunity} />
}

export default CreateGroupForm

import React, { useMemo, useState } from 'react'
import { ethers, providers, utils } from 'ethers'
import { erc20dummyABI, jsonRPCProvider, supportedChains, supportedChainsArray } from '../../constant/const'
import { FieldArray, FormikProvider, useFormik } from 'formik'
import { Chain } from 'wagmi'
import { ToolTip } from '@components/HOC/ToolTip'
import { PrimaryButton } from '@components/buttons'
import { useTranslation } from 'next-i18next'
import { polygonMumbai } from 'wagmi/chains'
import { PictureUpload } from '@components/PictureUpload'
import clsx from 'clsx'
import { buttonVariants } from '@styles/classes'
import { ChevronRightIcon, QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import { AnimatePresence, motion } from 'framer-motion'
import { useCreateCommunity } from '@/hooks/useCreateCommunity'
import Header from '@components/Header'
import { Breadcrumbs } from '@components/Breadcrumbs'
import Footer from '@components/Footer'
import Link from 'next/link'
import WithStandardLayout from '@components/HOC/WithStandardLayout'
import { isImageFile } from '@pages/communities/[groupId]/edit'

export interface HandleSetImage {
  file: File | null
  imageType: 'logo' | 'banner'
}
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

function CreateGroupFormUI({ onCreate }) {
  const { t } = useTranslation()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialValues = {
    tokenAddress: '',
    minAmount: 0,
    // maxAmount: 0,
    token: '-',
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
  const [er, setEr] = useState({})

  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const [tags, setTags] = useState<string[]>([])

  const handleNameChange = e => {
    setGroupName(e.target.value)
  }
  const handleDescriptionChange = e => {
    setGroupDescription(e.target.value)
  }
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // validate tags
    try {
      // spaces should be allowed
      if (e.target.value.match(/^[a-zA-Z0-9, ]*$/)) {
        setTags(e.target.value.split(','))
      }
    } catch (e) {
      console.log(e)
    }
  }
  const handleSetImage = ({ file, imageType }: HandleSetImage) => {
    const setImage = imageType === 'logo' ? setLogoFile : setBannerFile
    const setUrl = imageType === 'logo' ? setLogoUrl : setBannerUrl
    setImage(file)
    setUrl(file ? URL.createObjectURL(file) : '')
  }

  const [selectedChain, setSelectedChain] = useState<Chain>(supportedChains[polygonMumbai.id])

  const handleReqInput = async (e, i) => {
    let val = e.target.value.trim()
    await formik.setFieldValue(`tokenRequirements.${i}.tokenAddress`, val, false)
    if (val) {
      if (utils.isAddress(val)) {
        const p = new providers.JsonRpcProvider(`${selectedChain.rpcUrls['infura'].http[0]}/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`, selectedChain.id)

        let contract = new ethers.Contract(val, erc20dummyABI, p)
        const setNameNotFoundError = async () => {
          await formik.setFieldValue(`tokenRequirements.${i}.token`, '-', false)
          setEr(e => {
            return {
              ...e,
              [`tokenRequirements_${i}`]: 'Token name not found or Not supported with selected chain!',
            }
          })
        }
        Promise.all([contract?.symbol(), contract?.decimals()])
          ?.then(async ([symbol, decimals]) => {
            if (!symbol) {
              await setNameNotFoundError()
              return
            }
            await formik.setFieldValue(`tokenRequirements.${i}.token`, symbol, false)
            await formik.setFieldValue(`tokenRequirements.${i}.decimals`, decimals, false)
            setEr(e => {
              const errors = { ...e }
              delete errors[`tokenRequirements_${i}`]
              return errors
            })
          })
          .catch(async error => {
            console.log(error)
            await setNameNotFoundError()
          })
      } else {
        setEr(e => {
          return {
            ...e,
            [`tokenRequirements_${i}`]: 'Invalid token address',
          }
        })
        await formik.setFieldValue(`tokenRequirements.${i}.token`, '-', false)
      }
    } else {
      setEr(e => {
        return {
          ...e,
          [`tokenRequirements_${i}`]: 'Required*',
        }
      })
      await formik.setFieldValue(`tokenRequirements.${i}.token`, '-', false)
    }
  }

  const addReq = () => {
    if (!reqMandatory) {
      setReqMandatory(true)
    }
    formik.setFieldValue('tokenRequirements', [...formik.values.tokenRequirements, initialValues])
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
    onCreate({
      name: groupName,
      requirements: reqMandatory ? tokenRequirements : [],
      bannerFile: bannerFile,
      logoFile: logoFile,
      chainId: reqMandatory ? selectedChain.id : polygonMumbai.id,
      tags: tags,
      groupDescription,
      note: BigInt(0).toString(),
    })
    setIsSubmitting(false)
  }

  const selectChain = async (c: Chain) => {
    setSelectedChain(c)
    await formik.setFieldValue('tokenRequirements', [], false)
    setEr({})
  }

  const isSubmitDisabled =
    isSubmitting ||
    !groupName ||
    (reqMandatory &&
      (!formik.isValid ||
        formik.values.tokenRequirements.every(
          r => isNaN(r.minAmount) || !utils.isAddress(r.tokenAddress) || !r?.token || isNaN(r.decimals)
        )))

  return (
    <div className={clsx('mx-auto mb-64 h-screen w-full max-w-screen-xl space-y-6 sm:p-8 md:p-24')}>
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-semibold text-gray-700">{t('createCommunity')}</h1>
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
        <label className="text-lg text-gray-700">{t('placeholder.communityTags')}</label>
        <div className={'flex gap-2'}>
          {tags.map((tag, index) => (
            <div key={index}>
              {tag.trim() && (
                <span
                  key={index}
                  className="rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none"
                >
                  {tag}
                </span>
              )}
            </div>
          ))}
        </div>
        <input
          className="rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none"
          placeholder={'tag1, tag2, tag3'}
          type="text"
          value={tags}
          onChange={handleTagsChange}
        />
      </div>
      <div className="flex flex-col space-y-4">
        <label className="text-lg text-gray-700">{t('placeholder.communityDescription')}</label>
        <textarea
          className="h-20 rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none"
          placeholder={t('placeholder.communityDescriptionContent') || ''}
          value={groupDescription}
          onChange={handleDescriptionChange}
        />
      </div>

      <div className={'flex items-start gap-10'}>
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

      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4">
          <ToolTip
            type="primary"
            title={t('toolTip.tokenGating.title')}
            message={t('toolTip.tokenGating.message') || ''}
          >
            <QuestionMarkCircleIcon className="h-6 w-6 text-gray-700" />
          </ToolTip>

          <label htmlFor={'isChecked'} className="text-lg font-semibold text-gray-700">
            {t('toolTip.tokenGating.title')}
          </label>

          <input
            type="checkbox"
            id="isChecked"
            className="h-6 w-6 rounded border-2 border-primary-500 text-primary-500 focus:ring-0"
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

        <div className=" relative inline-flex w-[200px] gap-2">
          <div className="group relative w-60">
            <button
              disabled={!reqMandatory}
              className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-700 focus:outline-none"
            >
              {selectedChain.name}
              <ChevronRightIcon
                className="h-5 w-5 transform transition-transform duration-200 group-hover:rotate-90"
                aria-hidden="true"
              />
            </button>

            <div className="absolute left-0 z-50 hidden w-48 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {supportedChainsArray.map((k, i) => (
                  <button
                    key={k.id}
                    className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-200 focus:outline-none"
                    onClick={e => {
                      selectChain(k)
                      formik.setFieldValue('tokenRequirements', [initialValues])
                      if (!reqMandatory) setReqMandatory(true)
                    }}
                  >
                    {k.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button className={clsx(buttonVariants.success, 'w-[38.54px] border', 'hover:scale-[100%]')} onClick={addReq}>
            +
          </button>
        </div>
      </div>
      <hr className="my-4 border-border-on-dark" />
      <FormikProvider value={formik}>
        <AnimatePresence>
          <motion.form onSubmit={submit}>
            {formik.values.tokenRequirements.length === 0 && (
              <div className="flex flex-col items-center justify-center space-y-4 rounded-md border border-gray-200 bg-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-700">{t('placeholder.noTokenRequirements')}</p>
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
                      className="flex items-center space-x-4 h-[80px]"
                      initial={{ opacity: 0, y: 20, overflowY: 'visible' }}
                      animate={{ opacity: 1, y: 0, overflowY: 'hidden' }}
                      exit={{ opacity: 0, y: 20, overflowY: 'hidden' }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="pt-2 font-bold text-gray-700">{i + 1}.</p>
                      <div className="relative flex-grow">
                        <div className="text-blue-gray-500 absolute right-7 top-2/4 grid h-5 w-5 -translate-y-2/4 place-items-center">
                          <span className="text-xs font-semibold text-gray-500">{r.token}</span>
                        </div>
                        <input
                          disabled={!reqMandatory}
                          className={clsx(
                            er[`tokenRequirements_${i}`] ? 'border-red-600 focus:border-red-600 focus:ring-0' : 'border-gray-300',
                            er[`tokenRequirements_${i}`] && '',
                            'w-full rounded-md borde px-3 py-2 text-gray-700 focus:outline-none')}
                          value={r.tokenAddress}
                          onChange={e => handleReqInput(e, i)}
                          name={`tokenRequirements.${i}.tokenAddress`}
                          placeholder={t('placeholder.tokenAddress')}
                          type="text"
                        />
                        <small className={clsx('block absolute text-sm text-red-600', er[`tokenRequirements_${i}`] && 'visible')}>
                          {er[`tokenRequirements_${i}`]}
                        </small>
                      </div>

                      <div className="w-32">
                        <input
                          disabled={!reqMandatory}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none"
                          type="number"
                          min={0}
                          defaultValue={r.minAmount}
                          value={r.minAmount}
                          onChange={formik.handleChange}
                          name={`tokenRequirements.${i}.minAmount`}
                          placeholder={t('placeholder.minAmount')}
                        />
                      </div>

                      {/* <div className="w-32">
                        <input
                          disabled={!reqMandatory}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none"
                          type="number"
                          min={0}
                          defaultValue={r.maxAmount}
                          value={r.maxAmount}
                          onChange={formik.handleChange}
                          name={`tokenRequirements.${i}.maxAmount`}
                          placeholder={t('placeholder.maxAmount')}
                        />
                      </div> */}

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
                        className="border-red-500 aspect-1 h-11 w-11 rounded border text-red-500 transition-colors hover:bg-red-500 hover:text-white focus:outline-none"
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

      <div className={'flex flex-col justify-between space-x-0 py-2 md:flex-row md:space-x-2 md:py-4'}>
        <Link
          href="/"
          className="mb-2 rounded-lg border-2 border-red-400 p-2 text-red-500 hover:bg-red-500 hover:text-white md:mb-0 md:px-4"
        >
          Close
        </Link>
        <PrimaryButton
          className={clsx(buttonVariants.primarySolid, 'border')}
          disabled={isSubmitDisabled}
          onClick={submit}
        >
          {t('button.create')}
        </PrimaryButton>
      </div>
    </div>
  )
}

function CreateGroupForm() {
  const createCommunity = useCreateCommunity(() => {})
  return <CreateGroupFormUI onCreate={createCommunity} />
}

export default WithStandardLayout(CreateGroupForm)

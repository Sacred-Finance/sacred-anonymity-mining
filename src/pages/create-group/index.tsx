import React, { useMemo, useState } from 'react'
import { ethers, utils } from 'ethers'
import { erc20dummyABI, jsonRPCProvider, supportedChains, supportedChainsArray } from '@/constant/const'
import { FieldArray, FormikProvider, useFormik } from 'formik'
import { Chain } from 'wagmi'
import ToolTip from '@components/HOC/ToolTip'
import { PrimaryButton } from '@components/buttons'
import { useTranslation } from 'next-i18next'
import { polygonMumbai } from 'wagmi/chains'
import { PictureUpload } from '@components/PictureUpload'
import clsx from 'clsx'
import { buttonVariants } from '@styles/classes'
import { ChevronRightIcon, QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import { AnimatePresence, motion } from 'framer-motion'
import { useCreateCommunity } from '@/hooks/useCreateCommunity'
import Link from 'next/link'

export interface HandleSetImage {
  file: File | null
  imageType: 'logo' | 'banner'
}
function RemoveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
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
        const p = jsonRPCProvider

        const contract = new ethers.Contract(val, erc20dummyABI, p)
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
    <div
      className={clsx(
        'w-full max-w-screen-xl space-y-6 rounded-lg text-primary-600 shadow dark:bg-gray-900 dark:text-gray-200 sm:p-8 md:p-12 '
      )}
    >
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-semibold">{t('createCommunity')}</h1>
      </div>

      <div className="flex flex-col space-y-4">
        <label className="text-lg ">{t('placeholder.communityName')}</label>
        <input
          className="form-input rounded border border-gray-400 px-3 py-2 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
          placeholder={'An awesome community name'}
          type="text"
          value={groupName}
          onChange={handleNameChange}
        />
      </div>
      <div className="flex flex-col space-y-4">
        <label className="text-lg">{t('placeholder.communityTags')}</label>
        <div className={'flex gap-4'}>
          {tags.map((tag, index) => (
            <div key={index}>
              {tag.trim() && (
                <span
                  key={index}
                  className="rounded border border-gray-400 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                >
                  {tag}
                </span>
              )}
            </div>
          ))}
        </div>
        <input
          className="rounded border border-gray-400 px-3 py-2 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
          placeholder={'tag1, tag2, tag3'}
          type="text"
          value={tags}
          onChange={handleTagsChange}
        />
      </div>
      <div className="flex flex-col space-y-4">
        <label className="text-lg ">{t('placeholder.communityDescription')}</label>
        <textarea
          className="h-20 rounded border border-gray-400 px-3 py-2 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
          placeholder={t('placeholder.communityDescriptionContent') || ''}
          value={groupDescription}
          onChange={handleDescriptionChange}
        />
      </div>

      <div className={'flex items-start gap-4 dark:text-primary-500 '}>
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
          <ToolTip toolTip={t('toolTip.tokenGating.message') || ''}>
            <QuestionMarkCircleIcon className="h-6 w-6" />
          </ToolTip>

          <label htmlFor={'isChecked'} className="text-lg font-semibold">
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

        <div className=" relative inline-flex w-[200px] items-center gap-4">
          <div className="group relative w-60">
            <button
              disabled={!reqMandatory}
              className="flex w-full items-center justify-between rounded border border-gray-400 bg-white px-2 py-1 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {selectedChain.name}
              <ChevronRightIcon
                className="h-5 w-5 transform transition-transform duration-200 group-hover:rotate-90"
                aria-hidden="true"
              />
            </button>

            <div className="absolute left-0 z-50  hidden w-48 overflow-hidden rounded border border-gray-400 bg-white shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block dark:border-gray-600 dark:bg-gray-700">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {supportedChainsArray.map((k, i) => (
                  <button
                    key={k.id}
                    className="w-full border border-gray-400 px-3 py-2 text-left hover:bg-gray-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
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

          <button
            className={clsx('flex aspect-1 h-10 w-10 items-center justify-center border p-3 text-xl')}
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
              <div className="flex flex-col items-center justify-center space-y-4 rounded border border-gray-200 bg-gray-100 p-4">
                <p className="text-sm font-semibold ">{t('placeholder.noTokenRequirements')}</p>
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
                      className="flex items-center space-x-4"
                      initial={{ opacity: 0, y: 20, overflowY: 'visible' }}
                      animate={{ opacity: 1, y: 0, overflowY: 'hidden' }}
                      exit={{ opacity: 0, y: 20, overflowY: 'hidden' }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="pt-2 font-bold ">{i + 1}.</p>
                      <div className="relative flex-grow">
                        <input
                          disabled={!reqMandatory}
                          className="w-full rounded  border border-gray-400 px-3 py-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                          value={r.tokenAddress}
                          onChange={e => handleReqInput(e, i)}
                          name={`tokenRequirements.${i}.tokenAddress`}
                          placeholder={t('placeholder.tokenAddress')}
                          type="text"
                        />
                        <p className={clsx('absolute text-sm text-red-600', er[`tokenRequirements_${i}`] && 'visible')}>
                          {er[`tokenRequirements_${i}`]}
                        </p>
                      </div>

                      <div className="w-32">
                        <input
                          disabled={!reqMandatory}
                          className="dark:ext-gray-700 w-full  rounded border border-gray-400 px-3 py-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                          type="number"
                          min={0}
                          defaultValue={r.minAmount}
                          value={r.minAmount}
                          onChange={formik.handleChange}
                          name={`tokenRequirements.${i}.minAmount`}
                          placeholder={t('placeholder.minAmount')}
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
                        className="border-red-500 flex aspect-1 h-11 w-11 items-center justify-center rounded border text-red-500 transition-colors hover:bg-red-500 hover:text-white focus:outline-none"
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
          className="rounded border-2 border-red-400 p-2 text-red-500 hover:bg-red-500 hover:text-white md:px-4"
        >
          Close
        </Link>
        <PrimaryButton
          className={clsx(buttonVariants.primarySolid, 'border')}
          disabled={isSubmitDisabled || isSubmitting}
          onClick={submit}
          isLoading={isSubmitting}
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

export default CreateGroupForm

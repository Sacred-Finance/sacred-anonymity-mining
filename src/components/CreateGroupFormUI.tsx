import { useMemo, useState } from 'react'
import { ethers, utils } from 'ethers'
import { erc20dummyABI, jsonRPCProvider, supportedChains, supportedChainsArray } from '../constant/const'
import { FieldArray, FormikProvider, useFormik } from 'formik'
import { Chain, useChainId, useProvider } from 'wagmi'
import { ToolTip } from './HOC/ToolTip'
import { CancelButton, PrimaryButton } from './buttons'
import { useTranslation } from 'next-i18next'
import { polygonMumbai } from 'wagmi/chains'
import { PictureUpload } from './PictureUpload'
import _ from 'lodash'
import clsx from 'clsx'
import { classes, buttonVariants, primaryButtonStyle } from '../styles/classes'
import { toast } from 'react-toastify'
import { ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import { AnimatePresence, motion } from 'framer-motion'
function CreateGroupFormUI({ onCreateGroupClose, onCreate }) {
  const { t } = useTranslation()

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
  const handleNameChange = e => {
    setGroupName(e.target.value)
  }
  const handleDescriptionChange = e => {
    setGroupDescription(e.target.value)
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
    formik.setFieldValue('tokenRequirements', [...formik.values.tokenRequirements, initialValues])
  }

  const submit = async () => {
    const tokenRequirements = formik.values.tokenRequirements.map(v => {
      return {
        ...v,
        minAmount: BigInt(v?.minAmount * 10 ** v?.decimals).toString(),
      }
    })
    onCreate({
      name: groupName,
      requirements: reqMandatory ? tokenRequirements : [],
      bannerFile: bannerFile,
      logoFile: logoFile,
      chainId: reqMandatory ? selectedChain.id : polygonMumbai.id,
      groupDescription,
      note: BigInt(0).toString(),
    })
  }

  const selectChain = async (c: Chain) => {
    setSelectedChain(c)
    await formik.setFieldValue('tokenRequirements', [], false)
    setEr({})
  }

  const [selectChainOpen, setSelectChainOpen] = useState(false)

  const isSubmitDisabled =
    !groupName ||
    (reqMandatory &&
      (!formik.isValid ||
        formik.values.tokenRequirements.every(
          r => isNaN(r.minAmount) || !utils.isAddress(r.tokenAddress) || !r?.token || isNaN(r.decimals)
        )))

  const { logoUrl, bannerUrl } = useMemo(() => {
    return {
      logoUrl: logoFile ? URL.createObjectURL(logoFile) : '',
      bannerUrl: bannerFile ? URL.createObjectURL(bannerFile) : '',
    }
  }, [logoFile, bannerFile])

  return (
    <div className="flex max-h-[80vh] flex-col justify-between space-y-4 overflow-y-scroll rounded-lg border bg-background-dark p-2 text-white md:p-4">
      <div className="flex items-center justify-between py-2 md:py-4">
        <h1 className="text-xl font-semibold md:text-2xl">{t('createCommunity')}</h1>
      </div>
      <div className="flex flex-col space-y-2">
        <label className="pointer-events-none text-base md:text-lg">{t('placeholder.communityName')}</label>
        <input
          className={clsx(classes.input)}
          placeholder={'An awesome name'}
          type="text"
          value={groupName}
          onChange={handleNameChange}
        />
      </div>
      <div className="flex flex-col space-y-2">
        <label className="pointer-events-none text-base md:text-lg">{t('placeholder.communityDescription')}</label>
        <textarea
          className={clsx(classes.input)}
          placeholder={t('placeholder.communityDescriptionContent') || ''}
          value={groupDescription}
          onChange={handleDescriptionChange}
        />
      </div>
      <hr className="my-4 border-border-on-dark" />
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-3">
          <ToolTip
            type="primary"
            title={t('toolTip.tokenGating.title')}
            message={t('toolTip.tokenGating.message') || ''}
          >
            <QuestionMarkCircleIcon className="h-6 w-6" />
          </ToolTip>
          <label htmlFor={'isChecked'} className="text-lg font-semibold ">
            {t('toolTip.tokenGating.title')}
          </label>
          <input
            type="checkbox"
            id="isChecked"
            className="mr-3 h-6 w-6 rounded border-border-on-dark bg-primary-500 "
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
        <div className=" w-100 relative inline-flex gap-2">
          <div className={'w-100 group'}>
            <button disabled={!reqMandatory} className={clsx(primaryButtonStyle, buttonVariants.primarySolid, ' ')}>
              <span className="flex w-full items-center justify-between">
                {selectedChain.name}
                <ChevronRightIcon
                  className={clsx('-mr-1 ml-2 h-5 w-5 align-middle group-hover:rotate-90 ')}
                  aria-hidden="true"
                />
              </span>
            </button>

            <div className="w-100 disabled:group-hover:none absolute left-0 z-50 hidden  rounded-md bg-black/50 shadow-lg ring-1 ring-background-dark ring-opacity-5 group-hover:block">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {supportedChainsArray.map((k, i) => (
                  <button
                    key={k.id}
                    className={clsx(
                      'mt-2 w-full rounded-md border border-white/50  bg-primary-bg px-4 py-2 shadow-sm hover:border-white  focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 ',
                      buttonVariants.success,
                      primaryButtonStyle
                    )}
                    onClick={e => {
                      selectChain(k)
                      formik.setFieldValue('tokenRequirements', [initialValues])
                      // hide for half second
                    }}
                  >
                    {k.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            disabled={!reqMandatory}
            className={clsx(primaryButtonStyle, buttonVariants.success, 'w-[38.54px] border')}
            onClick={addReq}
          >
            +
          </button>
        </div>
      </div>
      <FormikProvider value={formik}>
        <motion.form onSubmit={submit}>
          {formik.values.tokenRequirements.length === 0 && (
            <div className="-m-2 flex h-full flex-col content-center items-center justify-center space-y-4 p-0">
              <p className="text-sm font-semibold text-white/50">{t('placeholder.noTokenRequirements')}</p>
            </div>
          )}
          <FieldArray
            name="tokenRequirements"
            render={({ remove }) => (
              <div className="flex flex-col justify-center space-y-4 pb-2">
                <AnimatePresence mode={'popLayout'}>
                  {formik.values.tokenRequirements.map((r, i, arr) => (
                    <motion.div
                      key={i}
                      layout
                      className="flex w-full items-center space-x-4"
                      initial={{ opacity: 0, y: 20, overflowY: 'visible' }}
                      animate={{ opacity: 1, y: 0, overflowY: 'hidden' }}
                      exit={{ opacity: 0, y: 20, overflowY: 'hidden' }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="pt-2">{i + 1}.</p>
                      <div className="relative w-[100%]">
                        <input
                          disabled={!reqMandatory}
                          className={clsx(classes.input, 'w-full')}
                          value={r.tokenAddress}
                          onChange={e => handleReqInput(e, i)}
                          name={`tokenRequirements.${i}.tokenAddress`}
                          placeholder={t('placeholder.tokenAddress')}
                          type="text"
                        />
                        <p
                          className={clsx(
                            'absolute text-sm text-error-dark',
                            er[`tokenRequirements_${i}`] && 'visible'
                          )}
                        >
                          {er[`tokenRequirements_${i}`]}
                        </p>
                      </div>

                      <div className="w-[25%]">
                        <input
                          disabled={!reqMandatory}
                          className={clsx('w-full', classes.input)}
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
                            toast.error(t('formErrors.tokenGating.min'), { type: 'error', toastId: 'min' })
                          }
                        }}
                        className={clsx(
                          primaryButtonStyle,
                          buttonVariants.primarySolid,
                          'hover:scale-[100%]',
                          'h-11 w-12 border focus:ring-0'
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          />
        </motion.form>
      </FormikProvider>
      <hr className="my-4 border-border-on-dark" />
      <div className="flex w-full flex-col content-center items-center justify-center space-y-4 p-2">
        <PictureUpload
          uploadedImageUrl={bannerUrl}
          displayName={t('banner')}
          name={'banner'}
          setImageFileState={setBannerFile}
        />

        <PictureUpload
          uploadedImageUrl={logoUrl}
          displayName={t('logo')}
          name={'logo'}
          setImageFileState={setLogoFile}
        />
      </div>
      <div className={'flex flex-col justify-between space-x-0 py-2 md:flex-row md:space-x-2 md:py-4'}>
        <CancelButton
          className="mb-2 rounded-lg bg-background-dark px-2 py-2 hover:bg-background-dark md:mb-0 md:px-4"
          onClick={onCreateGroupClose}
        >
          Close
        </CancelButton>
        <PrimaryButton
          className={clsx(primaryButtonStyle, buttonVariants.primaryOutline, 'border')}
          disabled={isSubmitDisabled}
          onClick={submit}
        >
          {t('button.create')}
        </PrimaryButton>
      </div>
    </div>
  )
}

export default CreateGroupFormUI

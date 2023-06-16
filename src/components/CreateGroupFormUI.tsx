import { useMemo, useState } from 'react'
import { ethers, utils } from 'ethers'
import { erc20dummyABI, supportedChains, supportedChainsArray } from '../constant/const'
import { FieldArray, FormikProvider, useFormik } from 'formik'
import { Chain, useChainId, useProvider } from 'wagmi'
import { ToolTip } from './HOC/ToolTip'
import { CancelButton, PrimaryButton } from './buttons'
import { useTranslation } from 'next-i18next'
import { polygonMumbai } from 'wagmi/chains'
import { PictureUpload } from './PictureUpload'
import _ from 'lodash'
import clsx from 'clsx'
import { classes, primaryButtonStyle } from '../styles/classes'
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
  const [reqMandatory, setReqMandatory] = useState(true)
  const [er, setEr] = useState({})

  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const handleInputChange = e => {
    setGroupName(e.target.value)
  }

  const [selectedChain, setSelectedChain] = useState<Chain>(supportedChains[polygonMumbai.id])

  const handleReqInput = async (e, i) => {
    let val = e.target.value.trim()
    await formik.setFieldValue(`tokenRequirements.${i}.tokenAddress`, val, false)
    if (val) {
      if (utils.isAddress(val)) {
        const p = new ethers.providers.JsonRpcProvider(selectedChain.rpcUrls.public.http[0])

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
    <div className="flex w-full flex-col justify-between space-x-4 rounded-lg border bg-primary-500 px-2">
      <div className="flex w-full items-center justify-between  py-4  text-on-dark-high-emphasis dark:text-on-light-high-emphasis">
        <h1 className="text-2xl font-semibold">{t('createCommunity')}</h1>
      </div>
      <div className="flex flex-col space-y-2">
        <label className="pointer-events-none text-lg text-on-dark-high-emphasis dark:text-on-light-high-emphasis">
          {t('placeholder.communityName')}
        </label>
        <input
          className={clsx(classes.input)}
          placeholder={'An awesome name'}
          type="text"
          value={groupName}
          onChange={handleInputChange}
        />
      </div>
      <hr className="my-4 border-border-on-dark" />
      <div className="flex items-center justify-between space-x-2">
        <ToolTip type="primary" title={t('toolTip.tokenGating.title')} message={t('toolTip.tokenGating.message') || ''}>
          <div className="flex items-center space-x-3">
            <p className="text-lg font-semibold text-on-dark-high-emphasis dark:text-on-light-high-emphasis">
              {t('toolTip.tokenGating.title')}
            </p>
            <input
              type="checkbox"
              id="isChecked"
              className="mr-3 h-6 w-6 rounded border-border-on-dark bg-brand text-on-dark-high-emphasis dark:text-on-light-high-emphasis"
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
        </ToolTip>
        <div className=" relative inline-flex gap-2">
          <div className={'group'}>
            <button
              disabled={!reqMandatory}
              className="border-on-dark content-on-dark-disabled rounded-md border bg-primary-light py-2 px-4 text-on-dark-high-emphasis shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 dark:text-on-light-high-emphasis"
            >
              {selectedChain.name}
            </button>

            <div className="absolute left-0 z-50 hidden w-40 rounded-md shadow-lg ring-1 ring-background-dark ring-opacity-5 group-hover:block">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {supportedChainsArray.map((k, i) => (
                  <button
                    key={k.id}
                    className="mt-1 block w-full  rounded border bg-primary-light px-4 py-2 text-left text-sm text-on-dark-high-emphasis hover:bg-primary-light hover:text-on-dark-medium-emphasis "
                    onClick={() => {
                      selectChain(k)
                      formik.setFieldValue('tokenRequirements', [initialValues])
                    }}
                  >
                    {k.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button disabled={!reqMandatory} className={clsx(primaryButtonStyle, 'w-24')} onClick={addReq}>
            +
          </button>
        </div>
      </div>
      &nbsp;
      <FormikProvider value={formik}>
        <form onSubmit={submit}>
          <FieldArray
            name="tokenRequirements"
            render={({ remove }) => (
              <div className="flex flex-col justify-center space-y-4 pb-2">
                {formik.values.tokenRequirements.map((r, i) => (
                  <div
                    key={i}
                    className="flex w-full  items-center space-x-4 text-on-dark-high-emphasis dark:text-on-light-high-emphasis"
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
                        className={clsx('absolute text-sm text-error-dark', er[`tokenRequirements_${i}`] && 'visible')}
                      >
                        {er[`tokenRequirements_${i}`]}
                      </p>
                    </div>

                    <div className="w-[25%]">
                      <input
                        disabled={!reqMandatory}
                        className={clsx(classes.input, 'w-full')}
                        type="number"
                        min={0}
                        defaultValue={r.minAmount}
                        value={r.minAmount}
                        onChange={formik.handleChange}
                        name={`tokenRequirements.${i}.minAmount`}
                        placeholder={t('placeholder.minAmount')}
                      />
                    </div>

                    <button disabled={!reqMandatory} onClick={() => remove(i)} className={clsx(primaryButtonStyle)}>
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
                  </div>
                ))}
              </div>
            )}
          />
        </form>
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
      <div className={'flex justify-between py-4 '}>
        <CancelButton
          className="rounded-lg bg-background-dark px-4 py-2 text-on-dark-high-emphasis hover:bg-background-dark dark:text-on-light-high-emphasis"
          onClick={onCreateGroupClose}
        >
          Close
        </CancelButton>
        <PrimaryButton
          className={clsx(primaryButtonStyle, `w-44 ${isSubmitDisabled ? 'opacity-50' : ''}`)}
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

const primaryInput = clsx(
  'rounded-lg',
  'border-0',
  'bg-background-dark',
  'py-2',
  'pl-8',
  'pr-4',
  'shadow-md',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-primary-dark'
)

const darkHighEmphasisText = 'text-on-dark-high-emphasis dark:text-on-light-high-emphasis'
const darkBorder = 'border-border-on-dark'

const disabledButton = clsx(
  'border-on-dark',
  'text-on-dark-high-emphasis dark:text-on-light-high-emphasis',
  'content-on-dark-disabled',
  'rounded-md',
  'border',
  'bg-primary-light',
  'py-2',
  'px-4',
  'shadow-sm',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-primary-light',
  'focus:ring-offset-2'
)

const selectableText = clsx(
  'text-on-dark-high-emphasis dark:text-on-light-high-emphasis',
  'hover:text-on-dark-medium-emphasis dark:text-on-light-medium-emphasis',
  'block',
  'w-full',
  'px-4',
  'py-2',
  'text-left',
  'text-sm',
  'hover:bg-primary-light'
)

const disabledInput = clsx(
  'text-on-dark-high-emphasis dark:text-on-light-high-emphasis',
  'w-full',
  'rounded-lg',
  'border-0',
  'bg-background-dark',
  'py-2',
  'pl-8',
  'pr-4',
  'shadow-md',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-primary-light'
)

const closeButton = clsx(
  'rounded-lg',
  'bg-background-dark',
  'px-4',
  'py-2',
  'text-on-dark-high-emphasis dark:text-on-light-high-emphasis',
  'hover:bg-background-dark'
)

const createButton = clsx(
  'rounded-lg',
  'bg-brand',
  'px-4',
  'py-2',
  'text-on-dark-high-emphasis dark:text-on-light-high-emphasis',
  'hover:bg-brand'
)

import React, { useEffect, useState } from 'react'
import { useAccount, useContractWrite } from 'wagmi'
import ForumABI from '../../constant/abi/Forum.json'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { ForumContractAddress } from '@/constant/const'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import { useFetchAdminsAndModerators } from '@/hooks/useFetchAdminsAndModerators'
import type { Address } from '@/types/common'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shad/ui/table'
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/20/solid'
import { PrimaryButton } from '@/components/buttons'
import { toast } from 'react-toastify'
import LoadingComponent from '@/components/LoadingComponent'
import clsx from 'clsx'

const Access: React.FC = () => {
  const { address } = useAccount()
  const navigate = useRouter()
  const { t } = useTranslation()

  const { isAdmin, isModerator, fetchIsAdmin } =
    useCheckIfUserIsAdminOrModerator(true)
  const {
    isFetching,
    isLoading,
    admins,
    moderators,
    fetchAdmins,
    fetchModerators,
  } = useFetchAdminsAndModerators()

  useEffect(() => {
    if (address) {
      fetchAdmins()
      fetchModerators()
      fetchIsAdmin()
    }
  }, [address])

  /** remove admin */
  const { write: writeRemoveAdmin, isLoading: isRemovingAdmin } =
    useContractWrite({
      address: ForumContractAddress as Address,
      abi: ForumABI.abi,
      functionName: 'removeAdmin',
      mode: 'recklesslyUnprepared',
      onSettled: (data, error) => {
        // setIsLoading(false)
      },
      onSuccess: async (data, variables) => {
        try {
          console.log('data', data)
          console.log('variables', variables)
          await data.wait()
          fetchAdmins()
          fetchIsAdmin()
          toast.success(`${variables?.args[0]} has been removed successfully`, {
            autoClose: 5000,
          })
        } catch (error) {}
      },
      onError: (error, variables) => {
        toast.error(error.message, { autoClose: 5000 })
      },
    })

  /** remove moderator */
  const { write: writeRemoveModerator, isLoading: isRemovingMod } =
    useContractWrite({
      address: ForumContractAddress as Address,
      abi: ForumABI.abi,
      functionName: 'removeModerators',
      mode: 'recklesslyUnprepared',
      onSettled: (data, error) => {
        // setIsLoading(false)
      },
      onSuccess: async (data, variables) => {
        try {
          await data.wait()
          fetchModerators()
          toast.success(`${variables?.args[0]} has been removed successfully`, {
            autoClose: 5000,
          })
        } catch (error) {}
      },
      onError: (error, variables) => {
        toast.error(error.message, { autoClose: 5000 })
      },
    })

  /** add admin */
  const { write: writeAddAdmin, isLoading: isAddingAdmin } = useContractWrite({
    address: ForumContractAddress as Address,
    abi: ForumABI.abi,
    functionName: 'addAdmins',
    mode: 'recklesslyUnprepared',
    onSettled: (data, error) => {
      // setIsLoading(false)
    },
    onSuccess: async (data, variables) => {
      try {
        console.log('data', data)
        console.log('variables', variables)
        await data.wait()
        fetchAdmins()
        toast.success(`${variables?.args[0]} has been added successfully`, {
          autoClose: 5000,
        })
      } catch (error) {}
    },
    onError: (error, variables) => {
      toast.error(error.message, { autoClose: 5000 })
    },
  })

  /** add moderator */
  const { write: writeAddModerator, isLoading: isAddingMod } = useContractWrite(
    {
      address: ForumContractAddress as Address,
      abi: ForumABI.abi,
      functionName: 'addModerators',
      mode: 'recklesslyUnprepared',
      onSettled: (data, error) => {
        // setIsLoading(false)
      },
      onSuccess: async (data, variables) => {
        try {
          await data.wait()
          fetchModerators()
          toast.success(`${variables?.args[0]} has been added successfully`, {
            autoClose: 5000,
          })
        } catch (error) {}
      },
      onError: (error, variables) => {
        toast.error(error.message, { autoClose: 5000 })
      },
    }
  )

  const onAddAdmin = value => {
    if (writeAddAdmin) {
      writeAddAdmin({
        recklesslySetUnpreparedArgs: [[value]],
      })
    }
  }

  const onAddModerator = value => {
    if (writeAddModerator) {
      writeAddModerator({
        recklesslySetUnpreparedArgs: [[value]],
      })
    }
  }

  const onRemoveAdmin = value => {
    if (writeRemoveAdmin) {
      writeRemoveAdmin({
        recklesslySetUnpreparedArgs: [value],
      })
    }
  }

  const onRemoveModerator = value => {
    if (writeRemoveModerator) {
      writeRemoveModerator({
        recklesslySetUnpreparedArgs: [[value]],
      })
    }
  }

  const AddressInput = ({ placeholder, onSubmit }) => {
    const [value, setValue] = useState('')
    const patternError = value && !/^0x[a-fA-F0-9]{40}$/g.test(value)
    return (
      <>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <PlusCircleIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="input"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 pl-10 text-sm text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary dark:focus:ring-primary"
            placeholder={placeholder}
            onChange={e => setValue(e.target.value)}
            value={value}
            required
            autoComplete="off"
          />
          <PrimaryButton
            type="button"
            className="hover:bg-primary-800 dark:hover:bg-primary-700 dark:focus:ring-primary-800 absolute bottom-2.5 right-2.5 top-[7px] rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-primary"
            onClick={() => onSubmit(value)}
            disabled={!value || Boolean(patternError)}
            isLoading={isAddingAdmin || isAddingMod}
          >
            Add
          </PrimaryButton>
        </div>
        {
          <div
            className={clsx([
              patternError ? 'visible text-red-800' : 'invisible',
              'mt-0',
            ])}
          >
            {t('formErrors.enterValidAddress')}
          </div>
        }
      </>
    )
  }

  const TableWrapper = ({ items, canRemove, caption, onRemove }) => {
    return (
      <>
        <Table className="min-h-[20vh]">
          <TableCaption>{caption}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">No.</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.map((a, i) => (
              <TableRow key={i} className="text-14px">
                <TableCell className="w-[100px]">{i + 1}</TableCell>
                <TableCell>{a}</TableCell>
                <TableCell>
                  {canRemove && (
                    <button
                      onClick={() => onRemove(a)}
                      aria-label="remove admin"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    )
  }

  if (!isAdmin && !isModerator && (isFetching || isLoading)) {
    return <LoadingComponent />
  }

  if (!isAdmin && !isModerator) {
    return <div>Not allowed to access </div>
  }
  return (
    <div className="">
      <div className="flex flex-col gap-3">
        <h1 className="text-left text-[22px] font-bold" color={'primary.500'}>
          Admins
        </h1>
        <AddressInput
          placeholder={'Admin Address'}
          onSubmit={v => onAddAdmin(v)}
        ></AddressInput>
        <TableWrapper
          caption={'Admins'}
          items={admins}
          canRemove={isAdmin}
          onRemove={v => onRemoveAdmin(v)}
        ></TableWrapper>

        <h1 className="text-left text-[22px] font-bold" color={'primary.500'}>
          Moderators
        </h1>
        <AddressInput
          placeholder={'Moderator Address'}
          onSubmit={v => onAddModerator(v)}
        ></AddressInput>
        <TableWrapper
          caption={'Moderators'}
          items={moderators}
          canRemove={isAdmin || isModerator}
          onRemove={v => onRemoveModerator(v)}
        ></TableWrapper>
      </div>
    </div>
  )
}

export default Access

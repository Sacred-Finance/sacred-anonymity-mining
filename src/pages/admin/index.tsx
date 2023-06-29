import React, { useState, useEffect } from 'react'
import { useAccount, useContractRead, useContractWrite } from 'wagmi'
import ForumABI from '../../constant/abi/Forum.json'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { ForumContractAddress } from 'constant/const'
import { useCheckIfUserIsAdminOrModerator } from 'hooks/useCheckIfUserIsAdminOrModerator'
import { useLoaderContext } from 'contexts/LoaderContext'
import { useFetchAdminsAndModerators } from 'hooks/useFetchAdminsAndModerators'

const Access: React.FC = () => {
  const { address } = useAccount()
  const navigate = useRouter()
  const { t } = useTranslation()

  const { isAdmin, isModerator, fetchIsAdmin } = useCheckIfUserIsAdminOrModerator(address)
  const { isFetching, isLoading, admins, moderators, fetchAdmins, fetchModerators } = useFetchAdminsAndModerators()
  const { setIsLoading } = useLoaderContext()

  useEffect(() => {
    console.log(address)
    if (address) {
      fetchIsAdmin()
      fetchAdmins()
      fetchModerators()
    } else {
      navigate.push('/')
    }
  }, [address])

  /** remove admin */
  const { write: writeRemoveAdmin } = useContractWrite({
    address: ForumContractAddress as `0x${string}`,
    abi: ForumABI.abi,
    functionName: 'removeAdmin',
    mode: 'recklesslyUnprepared',
    onSettled: (data, error) => {
      setIsLoading(false)
    },
    onSuccess: async (data, variables) => {
      try {
        await data.wait()
        fetchAdmins()
        fetchIsAdmin()
      } catch (error) {}
    },
  })

  /** remove moderator */
  const { write: writeRemoveModerator } = useContractWrite({
    address: ForumContractAddress as `0x${string}`,
    abi: ForumABI.abi,
    functionName: 'removeModerators',
    mode: 'recklesslyUnprepared',
    onSettled: (data, error) => {
      setIsLoading(false)
    },
    onSuccess: async (data, variables) => {
      try {
        await data.wait()
        fetchModerators()
      } catch (error) {}
    },
  })

  /** add admin */
  const { write: writeAddAdmin } = useContractWrite({
    address: ForumContractAddress as `0x${string}`,
    abi: ForumABI.abi,
    functionName: 'addAdmins',
    mode: 'recklesslyUnprepared',
    onSettled: (data, error) => {
      setIsLoading(false)
    },
    onSuccess: async (data, variables) => {
      try {
        await data.wait()
        fetchAdmins()
      } catch (error) {}
    },
  })

  /** add moderator */
  const { write: writeAddModerator } = useContractWrite({
    address: ForumContractAddress as `0x${string}`,
    abi: ForumABI.abi,
    functionName: 'addModerators',
    mode: 'recklesslyUnprepared',
    onSettled: (data, error) => {
      setIsLoading(false)
    },
    onSuccess: async (data, variables) => {
      try {
        await data.wait()
        fetchModerators()
      } catch (error) {}
    },
  })

  const onAddAdmin = value => {
    setIsLoading(true)
    writeAddAdmin({
      recklesslySetUnpreparedArgs: [[value]],
    })
  }

  const onAddModerator = value => {
    setIsLoading(true)
    writeAddModerator({
      recklesslySetUnpreparedArgs: [[value]],
    })
  }

  const onRemoveAdmin = value => {
    setIsLoading(true)
    writeRemoveAdmin({
      recklesslySetUnpreparedArgs: [value],
    })
  }

  const onRemoveModerator = value => {
    setIsLoading(true)
    writeRemoveModerator({
      recklesslySetUnpreparedArgs: [[value]],
    })
  }

  const AddressInput = ({ placeholder, onSubmit }) => {
    const [value, setValue] = useState('')
    const patternError = value && !/^0x[a-fA-F0-9]{40}$/g.test(value)
    return (
      <div className="flex flex-row gap-3">
        {/* <FormControl isInvalid={patternError}> */}
        <input
          type="text"
          // isInvalid={patternError}
          // focusBorderColor={patternError ? 'danger.300' : ''}
          // errorBorderColor="danger.300"
          placeholder={placeholder}
          onChange={e => setValue(e.target.value)}
          value={value}
          // variant={'outline'}
        />
        {patternError && <div>{t('formErrors.enterValidAddress')}</div>}
        {/* </FormControl> */}
        <button onClick={() => onSubmit(value)} disabled={!value || patternError}>
          Add
        </button>
      </div>
    )
  }

  const TableWrapper = ({ items, canRemove, onRemove }) => {
    return (
      <table className="table-fixed">
        <thead>
          <tr>
            <th>No.</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        {isFetching || isLoading ? (
          <tbody>
            <tr>
              <td>{/* <Skeleton display={'list-item'}></Skeleton> */}</td>
              <td>{/* <Skeleton display={'list-item'}></Skeleton> */}</td>
              <td>{/* <Skeleton display={'list-item'}></Skeleton> */}</td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {items?.map((a, i) => (
              <tr key={i} className="text-14px text-center">
                <td>{i + 1}</td>
                <td className="py-[8px]">{a}</td>
                <td className="py-[8px] text-center">
                  {canRemove && (
                    <button onClick={() => onRemove(a)} aria-label="remove admin">
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
    )
  }
  return (
    <div className='m-10'>
      <div className="flex flex-col gap-5">
        <h1 className="text-left font-bold text-[22px]" color={'primary.500'}>
          Admins
        </h1>
        <AddressInput placeholder={'Admin Address'} onSubmit={v => onAddAdmin(v)}></AddressInput>
        <TableWrapper items={admins} canRemove={isAdmin} onRemove={v => onRemoveAdmin(v)}></TableWrapper>

        <h1 className="text-left font-bold text-[22px]" color={'primary.500'}>
          Moderators
        </h1>
        <AddressInput placeholder={'Moderator Address'} onSubmit={v => onAddModerator(v)}></AddressInput>
        <TableWrapper
          items={moderators}
          canRemove={isAdmin || isModerator}
          onRemove={v => onRemoveModerator(v)}
        ></TableWrapper>
      </div>
    </div>
  )
}

export default Access

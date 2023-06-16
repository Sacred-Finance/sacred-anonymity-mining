import React, { createContext, ReactNode, useContext, useReducer, useMemo } from 'react'
import { Community, User } from '../lib/model'
import { ethers } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'
import _ from 'lodash'
import { useAccount } from 'wagmi'
import { useIdentity } from '../hooks/useIdentity'
import { useRouter } from 'next/router'

export type CommunityId = string | number | ethers.BigNumber
type CommunityContextType = {
  state: State
  dispatch: React.Dispatch<Action>
}

type State = {
  communities: Community[]
  users: User[]
  usersGrouped: { [key: string]: User[] }
}

type Action =
  | { type: 'ADD_COMMUNITY'; payload: Community }
  | { type: 'REMOVE_COMMUNITY'; payload: CommunityId }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'REMOVE_USER'; payload: User }
  | { type: 'SET_COMMUNITIES'; payload: Community[] }
  | { type: 'SET_USERS'; payload: User[] }

const initialState: State = {
  communities: [],
  users: [],
  usersGrouped: {},
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_COMMUNITIES':
      return { ...state, communities: action.payload }
    case 'SET_USERS':
      const usersGrouped = action.payload.reduce((acc, user) => {
        const groupId = getGroupIdOrUserId(user)
        return {
          ...acc,
          [groupId]: [user, ...(acc[groupId] || [])],
        }
      }, {})
      return { ...state, users: action.payload, usersGrouped }
    case 'ADD_COMMUNITY':
      return {
        ...state,
        communities: [action.payload, ...state.communities],
        usersGrouped: { ...state.usersGrouped, [getGroupIdOrUserId(action.payload)]: [] },
      }
    case 'REMOVE_COMMUNITY':
      return {
        ...state,
        communities: state.communities.filter(c => +c.id !== +action.payload),
      }
    case 'ADD_USER':
      const groupId =
        typeof action.payload.groupId === 'object' ? action.payload.groupId?.toNumber() : action.payload.groupId
      const newUsersGrouped = {
        ...state.usersGrouped,
        [groupId]: [action.payload, ...(state.usersGrouped[groupId] || [])],
      }
      const newCommunities = state.communities.map(c => {
        if (+c.groupId === +groupId) {
          return {
            ...c,
            userCount: c.userCount + 1,
          }
        } else {
          return c
        }
      })
      return {
        ...state,
        users: [action.payload, ...state.users],
        usersGrouped: newUsersGrouped,
        communities: newCommunities,
      }
    case 'REMOVE_USER':
      const userId = getGroupIdOrUserId(action.payload)
      const updatedUsersGrouped = { ...state.usersGrouped }
      if (updatedUsersGrouped[userId]) {
        updatedUsersGrouped[userId] = updatedUsersGrouped[userId].filter(
          u => u.identityCommitment !== action.payload.identityCommitment
        )
      }
      const updatedCommunities = state.communities.map(c => {
        if (+c.groupId === +userId && c.userCount > 0) {
          return {
            ...c,
            userCount: c.userCount - 1,
          }
        } else {
          return c
        }
      })
      return {
        ...state,
        users: state.users.filter(u => u.identityCommitment !== action.payload.identityCommitment),
        usersGrouped: updatedUsersGrouped,
        communities: updatedCommunities,
      }
    default:
      return state
  }
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined)

export const useCommunityContext = (): CommunityContextType => {
  const context = useContext(CommunityContext)
  if (!context) {
    throw new Error('useCommunityContext must be used within a CommunityProvider')
  }
  return context
}

export function getGroupIdOrUserId(communityOrUser: Community | User): number {
  return typeof communityOrUser.groupId === 'object'
    ? communityOrUser?.groupId?.toNumber?.()
    : Number(communityOrUser?.groupId)
}

export const CommunityProvider: React.FC<any> = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return <CommunityContext.Provider value={{ state, dispatch }}>{children}</CommunityContext.Provider>
}

export function useCommunities(): Community[] {
  const { state } = useCommunityContext()
  return state.communities
}

export function useCommunityById(id: string | number): Community | undefined {
  const { state } = useCommunityContext()
  return useMemo(() => state.communities.find(c => _.toNumber(c.groupId) === _.toNumber(id)), [state.communities, id])
}

export function useUsers(): User[] {
  const { state } = useCommunityContext()
  return state.users
}

export function useActiveUser(): User | undefined {
  const { state } = useCommunityContext()

  const router = useRouter()
  const { id } = router.query

  const identity = useIdentity(id ? { groupId: id as string } : undefined)

  return useMemo(() => state.users.find(c => c.identityCommitment === identity), [state.users, identity])
}

export function useUserById(id: string): User | undefined {
  const { state } = useCommunityContext()
  return useMemo(() => state.users.find(c => c.id === id), [state.users, id])
}

export function useGroupedUsers(): { [key: string]: User[] } {
  const { state } = useCommunityContext()
  return state.usersGrouped
}

export function useGroupedUserById(id: string): User[] | undefined {
  const { state } = useCommunityContext()
  return useMemo(() => state.usersGrouped[id], [state.usersGrouped, id])
}

export function useGroupedUserLength(id: string): number | undefined {
  const { state } = useCommunityContext()
  return useMemo(() => state.usersGrouped[id]?.length, [state.usersGrouped, id])
}

export function useHasUserJoined(communityId: string | number): User | undefined {
  const { state } = useCommunityContext()
  const { address: userAddress } = useAccount()

  // return useMemo(() => {
  if (!userAddress) return undefined
  if (!state.usersGrouped[0]) throw new Error('hasUserJoined - usersGrouped is undefined')
  if (!state.usersGrouped[communityId]) {
    return undefined
  }

  return state.usersGrouped[communityId]?.find(u => {
    const generatedIdentity = new Identity(`${userAddress}_${communityId}_${u.name}`)
    const userCommitment = generatedIdentity.getCommitment().toString()

    return _.toNumber(+u?.groupId) === _.toNumber(communityId) && u?.identityCommitment === userCommitment
  })
  // }, [state.usersGrouped, userAddress, communityId])
}

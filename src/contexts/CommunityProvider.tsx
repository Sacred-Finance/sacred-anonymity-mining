import React, { createContext, ReactNode, useContext, useReducer, useMemo, useEffect } from 'react'
import { User } from '@/lib/model'
import { ethers } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'
import _ from 'lodash'
import { useAccount } from 'wagmi'
import { useIdentity } from '@/hooks/useIdentity'
import { useRouter } from 'next/router'
import { useLoaderContext } from './LoaderContext'
import { Group, Item } from '@/types/contract/ForumInterface'
import { Topic } from '@components/Discourse/types'

export type CommunityId = string | number | ethers.BigNumber
type CommunityContextType = {
  state: State
  dispatch: React.Dispatch<Action>
}

interface ActiveCommunity {
  community: Group
  postList: Item[]
}
interface ActiveDiscourseCommunity {
  community: Topic
}

interface ActivePost {
  community: Group
  post: Item
  comments: Item[]
}

type State = {
  communities: Group[]
  users: User[]
  usersGrouped: { [key: string]: User[] }
  activeCommunity: ActiveCommunity | ActiveDiscourseCommunity
  activePost: ActivePost
}

type Action =
  | { type: 'ADD_COMMUNITY'; payload: Group }
  | { type: 'REMOVE_COMMUNITY'; payload: CommunityId }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'REMOVE_USER'; payload: User }
  | { type: 'SET_COMMUNITIES'; payload: Group[] }
  | { type: 'SET_USERS'; payload: User[] }
  // a new type for active community, and will store community details, post list, and comments for each post
  | { type: 'SET_ACTIVE_COMMUNITY'; payload: ActiveCommunity | ActiveDiscourseCommunity }
  | { type: 'SET_ACTIVE_POST'; payload: ActivePost }

const initialState: State = {
  communities: [],
  users: [],
  usersGrouped: {},
  activeCommunity: {
    community: {} as Group,
    postList: [] as Item[],
  },
  activePost: {
    community: {} as Group,
    post: {} as Item,
    comments: [] as Item[],
  },
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ACTIVE_COMMUNITY':
      return {
        ...state,
        activeCommunity: action.payload,
      }
    case 'SET_ACTIVE_POST':
      return {
        ...state,
        activePost: action.payload,
      }

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

export function getGroupIdOrUserId(communityOrUser: Group | User): number {
  return typeof communityOrUser.groupId === 'object'
    ? communityOrUser?.groupId?.toNumber?.()
    : Number(communityOrUser?.groupId)
}

export const CommunityProvider: React.FC<any> = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { setIsLoading } = useLoaderContext()

  // when state has communities, stop loading
  useEffect(() => {
    if (state.communities.length > 0) {
      console.log('communities loaded')
      setIsLoading(false)
    }
  }, [state.communities])

  return <CommunityContext.Provider value={{ state, dispatch }}>{children}</CommunityContext.Provider>
}

export function useCommunityById(id: string | number): Group | undefined {
  const { state } = useCommunityContext()
  return useMemo(() => state.communities.find(c => _.toNumber(c.groupId) === _.toNumber(id)), [state.communities, id])
}

export function useUsers(): User[] {
  const { state } = useCommunityContext()
  return state.users
}

export function useActiveUser({ groupId }): User | undefined {
  const { state } = useCommunityContext()
  const identity = useIdentity(groupId ? { groupId: groupId as string } : undefined)

  return useMemo(
    () => state.users.find(c => c.identityCommitment === identity?.getCommitment().toString()),
    [state.users, identity]
  )
}

export function useUserIfJoined(communityId: string | number): (User & { avatar: string }) | false {
  const { state } = useCommunityContext()
  useCommunityById(communityId)
  const { address: userAddress } = useAccount()

  if (!userAddress) return false
  if (!state.usersGrouped) throw new Error('hasUserJoined - usersGrouped is undefined')
  if (!state.usersGrouped[communityId]) {
    return false
  }

  const foundUser = state.usersGrouped[communityId]?.find(u => {
    const generatedIdentity = new Identity(`${userAddress}_${communityId}_${u.name}`)
    const userCommitment = generatedIdentity.getCommitment().toString()

    return _.toNumber(+u?.groupId) === _.toNumber(communityId) && u?.identityCommitment === userCommitment
  }) as User

  if (foundUser) {
    // Adding avatar to the found user
    return addAvatarToUser(foundUser)
  }

  return false
}

export const addAvatarToUser = (user: User) => {
  const avatar = getAvatarUrl(user?.identityCommitment?.toString());
  return { ...user, avatar }
}

export const getAvatarUrl = (hash: string) => {
  return `https://robohash.org/${hash}`
}

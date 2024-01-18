import type { FC, ReactNode } from 'react'
import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import type { User } from '@/lib/model'
import _ from 'lodash'
import type { Group, Item } from '@/types/contract/ForumInterface'
import type { Action, CommunityContextType, State } from '@/contexts/CommunityTypes'

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
  isAdmin: false,
  isModerator: false,
  communitiesJoined: {},
}

function reducer(state: State, action: Action): State {
  const updateUsersGrouped = newUser => {
    const groupId = getGroupIdOrUserId(newUser)
    return {
      ...state.usersGrouped,
      [groupId]: [newUser, ...(state.usersGrouped[groupId] || [])],
    }
  }

  const updateCommunitiesUserCount = (groupId, increment = true) => {
    return state.communities.map(community => {
      if (+community.groupId === +groupId) {
        return {
          ...community,
          userCount: increment ? community.userCount + 1 : community.userCount - 1,
        }
      }
      return community
    })
  }

  switch (action.type) {
    case 'SET_ACTIVE_COMMUNITY':
      return { ...state, activeCommunity: action.payload }

    case 'SET_ACTIVE_POST':
      return { ...state, activePost: action.payload }

    case 'SET_COMMUNITIES':
      return { ...state, communities: action.payload }

    case 'SET_USERS':
      const usersGrouped = action.payload.reduce(
        (acc, user) => ({
          ...acc,
          [getGroupIdOrUserId(user)]: [user, ...(acc[getGroupIdOrUserId(user)] || [])],
        }),
        {}
      )
      return { ...state, users: action.payload, usersGrouped }

    case 'ADD_COMMUNITY':
      return {
        ...state,
        communities: [action.payload, ...state.communities],
        usersGrouped: updateUsersGrouped(action.payload),
      }

    case 'REMOVE_COMMUNITY':
      return {
        ...state,
        communities: state.communities.filter(c => +c.id !== +action.payload),
      }

    case 'ADD_USER':
      const groupId =
        typeof action.payload.groupId === 'object' ? action.payload.groupId.toNumber() : action.payload.groupId
      return {
        ...state,
        users: [action.payload, ...state.users],
        usersGrouped: updateUsersGrouped(action.payload),
        communities: updateCommunitiesUserCount(groupId),
        communitiesJoined: { ...state.communitiesJoined, [groupId]: true },
      }

    case 'REMOVE_USER':
      const userId = getGroupIdOrUserId(action.payload)
      const updatedUsersGrouped = { ...state.usersGrouped }
      updatedUsersGrouped[userId] = updatedUsersGrouped[userId]?.filter(
        u => u.identityCommitment !== action.payload.identityCommitment
      )
      return {
        ...state,
        users: state.users.filter(u => u.identityCommitment !== action.payload.identityCommitment),
        usersGrouped: updatedUsersGrouped,
        communities: updateCommunitiesUserCount(userId, false),
        communitiesJoined: { ...state.communitiesJoined, [userId]: false },
      }

    case 'SET_USER_ACCESS':
      return {
        ...state,
        isAdmin: action.payload.isAdmin ?? state.isAdmin,
        isModerator: action.payload.isModerator ?? state.isModerator,
      }

    case 'UPDATE_COMMUNITIES_JOINED':
      return {
        ...state,
        communitiesJoined: {
          ...state.communitiesJoined,
          [action.payload.communityId]: action.payload.hasJoined,
        },
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
  const groupId = communityOrUser.groupId

  // Type guard to check if toNumber exists on the object
  const isBigNumberWithToNumber = (value: any): value is { toNumber: () => number } => {
    return value && typeof value.toNumber === 'function'
  }

  // Check if groupId has a toNumber method
  if (isBigNumberWithToNumber(groupId)) {
    return groupId.toNumber()
  }

  // Otherwise, convert groupId to a number (handles string, number, Bytes, etc.)
  return Number(groupId) || 0
}

export const CommunityProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(state.communities.length === 0)
  }, [state.communities])

  return <CommunityContext.Provider value={{ state, dispatch, isLoading }}>{children}</CommunityContext.Provider>
}

export function useCommunityById(id: string | number): Group | undefined {
  const { state } = useCommunityContext()
  return useMemo(() => state.communities.find(c => _.toNumber(c.groupId) === _.toNumber(id)), [state.communities, id])
}

import React, { createContext, ReactNode, useContext, useReducer, useMemo, useEffect } from 'react'
import { User } from '@/lib/model'
import { ethers } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'
import _, { isBoolean, isUndefined } from 'lodash'
import { useAccount } from 'wagmi'
import { useIdentity } from '@/hooks/useIdentity'
import { Group, Item } from '@/types/contract/ForumInterface'
import { Topic } from '@components/Discourse/types'
import { createNote, hasUserJoined } from '@/lib/utils'

export type CommunityId = string | number | ethers.BigNumber
type CommunityContextType = {
  state: State
  dispatch: React.Dispatch<Action>
  isLoading: boolean
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
  isAdmin: boolean
  isModerator: boolean
  communitiesJoined: { [key: string]: User | boolean }
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
  | { type: 'SET_USER_ACCESS'; payload: { isAdmin?: boolean; isModerator?: boolean } }
  | { type: 'UPDATE_COMMUNITIES_JOINED'; payload: { communityId: number, hasJoined:User | boolean } }

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
  communitiesJoined: {}
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ACTIVE_COMMUNITY':
      return {
        ...state,
        activeCommunity: {
          ...action.payload,
          community: { ...action.payload.community, id: ethers.BigNumber.from(action.payload.community.id) },
        },
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
        communitiesJoined: { ...state.communitiesJoined, [groupId]: true }
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
        communitiesJoined: { ...state.communitiesJoined, [userId]: false }
      }

    case 'SET_USER_ACCESS': {
      const isAdmin = isBoolean(action.payload.isAdmin) ? action.payload.isAdmin : state.isAdmin
      const isModerator = isBoolean(action.payload.isModerator) ? action.payload.isModerator : state.isModerator
      return {
        ...state,
        isAdmin,
        isModerator,
      }
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
  return typeof communityOrUser.groupId === 'object'
    ? communityOrUser?.groupId?.toNumber?.()
    : Number(communityOrUser?.groupId)
}

export const CommunityProvider: React.FC<any> = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isLoading, setIsLoading] = React.useState(true)

  // when state has communities, stop loading
  useEffect(() => {
    if (state.communities.length > 0) {
      console.log('communities loaded')
      setIsLoading(false)
    }
  }, [state.communities])

  return <CommunityContext.Provider value={{ state, dispatch, isLoading }}>{children}</CommunityContext.Provider>
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
    () => state.usersGrouped[groupId]?.find(c => c.identityCommitment === identity?.getCommitment().toString()),
    [state.usersGrouped, identity]
  )
}

export function useUserIfJoined(communityId: string | number): User | boolean {
  communityId = Number(communityId)
  const { state, dispatch } = useCommunityContext()
  const { address: userAddress } = useAccount()
  const [userJoined, setUserJoined] = React.useState<User | boolean>(null)

  useEffect(() => {
    checkIfUserHasJoined()
  }, [userAddress, state.usersGrouped[communityId]?.length])

  const checkIfUserHasJoined = async () => {
    if (!userAddress) return false
    if (isUndefined(state.communitiesJoined[communityId])) {
      const generatedIdentity = new Identity(`${userAddress}_${communityId}_anon`)
      const userJoined = await hasUserJoined(Number(communityId), generatedIdentity.getCommitment().toString())
      if (userJoined) {
        const u = {
          name: 'anon',
          identityCommitment: generatedIdentity.getCommitment().toString(),
          groupId: +communityId,
          id: '',
        }
        setUserJoined(u)
        dispatch({ type: 'UPDATE_COMMUNITIES_JOINED', payload: {communityId: Number(communityId), hasJoined: u} })
      } else {
        dispatch({ type: 'UPDATE_COMMUNITIES_JOINED', payload: {communityId: Number(communityId), hasJoined: false} })
        setUserJoined(false)
      }
    } else {
      setUserJoined(state.communitiesJoined[communityId])
    }
  }
  return userJoined
}

// For account page
export function useCommunitiesCreatedByUser() {
  const { state } = useCommunityContext()
  const { address: userAddress } = useAccount()
  const [communitiesCreated, setCommunitiesCreated] = React.useState<Group[]>([])

  useEffect(() => {
    filterCommunitiesCreatedByUser()
  }, [userAddress, state.communities?.length])

  const filterCommunitiesCreatedByUser = async () => {
    if (userAddress && state.communities?.length) {
      const communitiesCreated: Group[] = []
      for (let i = 0; i < state.communities.length; i++) {
        const generatedIdentity = new Identity(`${userAddress}`)
        const generatedNote = (await createNote(generatedIdentity)).toString()
        if (state.communities[i].note === generatedNote) {
          communitiesCreated.push(state.communities[i])
        }
      }
      setCommunitiesCreated(communitiesCreated)
    } else {
      setCommunitiesCreated([])
    }
  }

  return { communitiesCreated }
}

// For account page
export function useCommunitiesJoinedByUser() {
  const { state, dispatch } = useCommunityContext()
  const { address: userAddress } = useAccount()
  const [communitiesJoined, setCommunitiesJoined] = React.useState<Group[]>([])

  useEffect(() => {
    filterCommunitiesJoinedByUser()
  }, [userAddress, state.communities?.length, state.usersGrouped])

  const filterCommunitiesJoinedByUser = async () => {
    if (userAddress && state.communities?.length) {
      const communitiesJoined: Group[] = []
      await Promise.all(state?.communities.map(community => {
        if (isUndefined(state.communitiesJoined[Number(community.id)])) {
          const generatedIdentity = new Identity(`${userAddress}_${Number(community.id)}_anon`)
          return hasUserJoined(Number(community.id), generatedIdentity.commitment.toString()).then(userJoined => {
            if (userJoined) {
              communitiesJoined.push(community)
              dispatch({ type: 'UPDATE_COMMUNITIES_JOINED', payload: {communityId: Number(community.id), hasJoined: true} })
            }
          })
        } else if (state.communitiesJoined[Number(community.id)]) {
          return Promise.resolve(communitiesJoined.push(community))
        }
      }))
      setCommunitiesJoined(communitiesJoined)
    } else {
      setCommunitiesJoined([])
    }
  }

  return { communitiesJoined }
}

export const addAvatarToUser = (user: User) => {
  const avatar = getAvatarUrl(user?.identityCommitment?.toString())
  return { ...user, avatar }
}

export const getAvatarUrl = (hash: string) => {
  return `https://robohash.org/${hash}`
}

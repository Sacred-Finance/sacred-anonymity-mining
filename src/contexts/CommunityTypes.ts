import type { Group, Item } from '@/types/contract/ForumInterface'
import type { User } from '@/lib/model'
import type { Dispatch } from 'react'
import type { ethers } from 'ethers'
import type { BigNumberish } from '@semaphore-protocol/group'

export type CommunityId = string | number | ethers.BigNumber | BigNumberish
export type CommunityContextType = {
  state: State
  dispatch: Dispatch<Action>
  isLoading: boolean
}

interface ActiveCommunity {
  community: Group
  postList: Item[]
}

interface ActivePost {
  community: Group
  post: Item
  comments: Item[]
}

export type State = {
  communities: Group[]
  users: User[]
  usersGrouped: { [key: string]: User[] }
  activeCommunity: ActiveCommunity | undefined
  activePost: ActivePost | undefined
  isAdmin: boolean
  isModerator: boolean
  communitiesJoined: { [key: string]: User | false }
}

export enum ActionType {
  ADD_COMMUNITY = 'ADD_COMMUNITY',
  REMOVE_COMMUNITY = 'REMOVE_COMMUNITY',
  ADD_USER = 'ADD_USER',
  REMOVE_USER = 'REMOVE_USER',
  SET_COMMUNITIES = 'SET_COMMUNITIES',
  SET_USERS = 'SET_USERS',
  SET_ACTIVE_COMMUNITY = 'SET_ACTIVE_COMMUNITY',
  SET_ACTIVE_POST = 'SET_ACTIVE_POST',
  SET_USER_ACCESS = 'SET_USER_ACCESS',
  UPDATE_COMMUNITIES_JOINED = 'UPDATE_COMMUNITIES_JOINED',
}

export type Action =
  | { type: ActionType.ADD_COMMUNITY; payload: Group }
  | { type: ActionType.REMOVE_COMMUNITY; payload: CommunityId }
  | { type: ActionType.ADD_USER; payload: User }
  | { type: ActionType.REMOVE_USER; payload: User }
  | { type: ActionType.SET_COMMUNITIES; payload: Group[] }
  | { type: ActionType.SET_USERS; payload: User[] }
  // a new type for active community, and will store community details, post list, and comments for each post
  | {
      type: ActionType.SET_ACTIVE_COMMUNITY
      payload: ActiveCommunity | undefined
    }
  | { type: ActionType.SET_ACTIVE_POST; payload: ActivePost }
  | {
      type: ActionType.SET_USER_ACCESS
      payload: { isAdmin?: boolean; isModerator?: boolean }
    }
  | {
      type: ActionType.UPDATE_COMMUNITIES_JOINED
      payload: { communityId: number; hasJoined: User | boolean }
    }

import { Proof } from '@semaphore-protocol/proof'
import axios from 'axios'
import { BigNumberish } from 'ethers'
import { RELAYER_URL } from '../constant/const'
import { CommunityDetails, ItemCreationRequest, PollRequestStruct, ReputationProofStruct, Requirement } from './model'
import { Item } from '@/types/contract/ForumInterface'

export async function joinGroup(groupId: string, identityCommitment: string, username: string, note: string) {
  return axios.post(`${RELAYER_URL}/join-group`, {
    identityCommitment,
    groupId,
    username,
    note
  })
}

export async function leaveGroup(groupId: string, identityCommitment: string, a: any, b: any, c: any, siblings:any[], pathIndices: number[]) {
  return axios.post(`${RELAYER_URL}/leave-group`, {
    identityCommitment,
    groupId,
    a,
    b,
    c,
    siblings,
    pathIndices
  })
}

export async function createGroup(requirements: Requirement[], groupName: string, chainId: number, details: CommunityDetails, note: string) {
  return axios.post(`${RELAYER_URL}/create-group`, {
    groupName,
    requirements,
    chainId,
    details,
    note: note.toString()
  });
}

export async function createPost(
  groupId: string,
  request: ItemCreationRequest,
  solidityProof: Proof,
  unirepProof: ReputationProofStruct,
  asPoll: boolean,
  pollRequest: PollRequestStruct
) {
  return axios.post(`${RELAYER_URL}/post`, {
    groupId,
    request,
    solidityProof,
    unirepProof,
    asPoll,
    pollRequest
  })
}

export async function createComment(
  groupId: string,
  parentId: string,
  request: ItemCreationRequest,
  solidityProof: Proof,
  unirepProof: ReputationProofStruct,
  asPoll: boolean,
  pollRequest: PollRequestStruct
) {
  return axios.post(`${RELAYER_URL}/comment`, {
    groupId,
    parentId,
    request,
    solidityProof,
    unirepProof,
    asPoll,
    pollRequest
  })
}

export async function edit(itemId: string, contentCID: string, note: BigInt, a, b, c) {
  return axios.post(`${RELAYER_URL}/edit`, {
    a,
    b,
    c,
    itemId,
    contentCID,
  })
}

export async function vote(
  itemId: string,
  groupId: string,
  type: number,
  merkleRoot: string,
  nullifierHash: string,
  solidityProof: Proof,
  voteRepProof: ReputationProofStruct
) {
  return axios.post(`${RELAYER_URL}/vote`, {
    itemId,
    groupId,
    type,
    merkleRoot,
    nullifierHash,
    solidityProof,
    voteRepProof,
  })
}

export async function userUnirepSignUp(publicSignals: BigNumberish[], proof: BigNumberish[]) {
  return axios.post(`${RELAYER_URL}/user-unirep-sign-up`, {
    publicSignals,
    proof,
  })
}


export async function setGroupDetails(groupId: string, a: any, b: any, c: any, details: any) {
  return axios.post(`${RELAYER_URL}/set-group-details`, {
    groupId,
    a,
    b,
    c,
    details
  })
}

export async function setGroupDescription(groupId: string, a: any, b: any, c: any, description: string) {
  return axios.post(`${RELAYER_URL}/set-group-description`, {
    groupId,
    a,
    b,
    c,
    description
  })
}

export async function setGroupTags(groupId: string, a: any, b: any, c: any, tags: string[]) {
  return axios.post(`${RELAYER_URL}/set-group-tags`, {
    groupId,
    a,
    b,
    c,
    tags
  })
}

export async function setGroupBanner(groupId: string, a: any, b: any, c: any, bannerCID: string) {
  return axios.post(`${RELAYER_URL}/set-group-banner`, {
    groupId,
    a,
    b,
    c,
    bannerCID
  })
}

export async function setGroupLogo(groupId: string, a: any, b: any, c: any, logoCID: string) {
  return axios.post(`${RELAYER_URL}/set-group-logo`, {
    groupId,
    a,
    b,
    c,
    logoCID
  })
}

export async function votePoll(itemId: string, groupId: string, pollData: number[], merkleRoot: BigNumberish, nullifierHash: BigNumberish, solidityProof: Proof, voteRepProof: ReputationProofStruct) {
  return axios.post(`${RELAYER_URL}/vote-poll`, {
    itemId,
    groupId,
    pollData,
    merkleRoot,
    nullifierHash,
    solidityProof,
    voteRepProof
  })
}

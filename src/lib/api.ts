import { Proof } from '@semaphore-protocol/proof'
import axios from 'axios'
import { BigNumberish } from 'ethers'
import { RELAYER_URL } from '../constant/const'
import { CommunityDetails, ReputationProofStruct, Requirement } from './model'

export async function joinGroup(groupId: string, identityCommitment: string, username: string) {
  return axios.post(`${RELAYER_URL}/join-group`, {
    identityCommitment,
    groupId,
    username,
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
  contentCID: string,
  note: BigInt,
  groupId: string,
  merkleRoot: string,
  nullifierHash: string,
  solidityProof: Proof,
  unirepProof: ReputationProofStruct
) {
  return axios.post(`${RELAYER_URL}/post`, {
    contentCID,
    note: note.toString(),
    groupId,
    merkleRoot,
    nullifierHash,
    solidityProof,
    unirepProof,
  })
}

export async function createComment(
  contentCID: string,
  note: BigInt,
  groupId: string,
  parentId: string,
  merkleRoot: string,
  nullifierHash: string,
  solidityProof: Proof,
  unirepProof: ReputationProofStruct
) {
  return axios.post(`${RELAYER_URL}/comment`, {
    contentCID,
    note: note.toString(),
    groupId,
    parentId,
    merkleRoot,
    nullifierHash,
    solidityProof,
    unirepProof,
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

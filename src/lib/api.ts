import { Proof } from '@semaphore-protocol/proof'
import axios from 'axios'
import { BigNumberish } from 'ethers'
import { RELAYER_URL } from '../constant/const'
import { ReputationProofStruct, Requirement } from './model'

export async function joinGroup(groupId: string, identityCommitment: string, username: string) {
  return axios.post(`${RELAYER_URL}/join-group`, {
    identityCommitment,
    groupId,
    username,
  })
}

export async function createGroup(
  identityCommitment: string,
  requirements: Requirement[],
  groupName: string,
  chainId: number,
  details: {
    description: string
    tags: string[]
    bannerCID: string
    logoCID: string
  },
  note: BigInt
) {
  return axios.post(`${RELAYER_URL}/create-group`, {
    identityCommitment,
    groupName,
    requirements,
    chainId,
    details,
    note
  })
}

export async function createPost(
  contentCID: string,
  note: BigInt,
  groupId: string,
  merkleRoot: BigNumberish,
  nullifierHash: BigNumberish,
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
  merkleRoot: BigNumberish,
  nullifierHash: BigNumberish,
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
    note: note.toString(),
  })
}

export async function vote(
  itemId: string,
  groupId: string,
  type: number,
  merkleRoot: BigNumberish,
  nullifierHash: BigNumberish,
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

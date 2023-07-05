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

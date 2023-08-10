import { useActiveUser, useUsers } from '@/contexts/CommunityProvider'
import { createPost, votePoll } from '@/lib/api'
import { getGroupWithPostData } from '@/lib/fetcher'
import { ItemCreationRequest, PollRequestStruct, ReputationProofStruct } from '@/lib/model'
import { UnirepUser } from '@/lib/unirep'
import { createNote, getBytes32FromIpfsHash, hashBytes, hashBytes2, uploadIPFS } from '@/lib/utils'
import { Group } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import { generateProof } from '@semaphore-protocol/proof'
import { BigNumber } from 'ethers'
import { mutate } from 'swr'
import { useAccount } from 'wagmi'

export const usePoll = ({ groupId }) => {
  const { address } = useAccount()
  const users = useUsers()
  const activeUser = useActiveUser({ groupId })
  const createPoll = async (
    message: string,
    pollType: number,
    duration: number, //Hour
    answers: string[],
    rateScaleFrom: number,
    rateScaleTo: number,
    onSuccessCallback: () => void,
    onErrorCallback: (err) => void
  ): Promise<any> => {
    let currentDate = new Date()
    const _message = currentDate.getTime() + '#' + message

    const cid = await uploadIPFS(_message)
    if (!cid) {
      throw 'Upload to IPFS failed'
    }

    console.log(`IPFS CID: ${cid}`)
    const signal = getBytes32FromIpfsHash(cid)
    const extraNullifier = hashBytes(signal).toString()
    let group = new Group(groupId)
    const u = users.filter(u => u?.groupId === +groupId)
    group.addMembers(u.map(u => u?.identityCommitment))
    const userIdentity = new Identity(`${address}_${groupId}_${activeUser.name}`)
    const unirepUser = new UnirepUser(userIdentity)
    await unirepUser.updateUserState()
    const userState = await unirepUser.getUserState()
    const note = await createNote(userIdentity)
    let reputationProof = await userState.genProveReputationProof({
      epkNonce: 0,
      minRep: 0,
      graffitiPreImage: 0,
    })

    let answerCIDs = []
    for (let i = 0; i < answers.length; i++) {
      const cid = await uploadIPFS(answers[i])
      if (!cid) {
        throw 'Upload to IPFS failed'
      }
      const answerCID = getBytes32FromIpfsHash(cid)
      answerCIDs.push(answerCID)
    }

    const epochData = unirepUser.getEpochData()
    const epoch: ReputationProofStruct = {
      publicSignals: epochData.publicSignals,
      proof: epochData.proof,
      publicSignalsQ: reputationProof.publicSignals,
      proofQ: reputationProof.proof,
      ownerEpoch: BigNumber.from(epochData.epoch)?.toString(),
      ownerEpochKey: epochData.epochKey,
    }

    const fullProof = await generateProof(userIdentity, group, extraNullifier, hashBytes(signal))
    const request: ItemCreationRequest = {
      contentCID: signal,
      merkleTreeRoot: fullProof.merkleTreeRoot.toString(),
      nullifierHash: fullProof.nullifierHash.toString(),
      note: note.toString(),
    }

    const pollRequest: PollRequestStruct = {
      pollType,
      duration,
      answerCount: answers.length,
      rateScaleFrom,
      rateScaleTo,
      answerCIDs,
    }

    try {
      const { status } = await createPost(groupId, request, fullProof.proof, epoch, true, pollRequest)
      if (status === 200) {
        console.log(`A post posted by user ${address}`)
        await mutate(getGroupWithPostData(groupId))
        onSuccessCallback()
      } else {
        onErrorCallback('Creating a post failed!')
        throw new Error('Creating a post failed!')
      }
    } catch (error) {
      onErrorCallback(error)
    }
  }

  const submitPoll = async (id, pollData: number[], onSuccessCallback, onErrorCallback) => {
    const signal = hashBytes2(id, 'votePoll')
    const extraNullifier = signal.toString()
    let group = new Group(groupId)
    const u = users.filter(u => u?.groupId === +groupId)
    group.addMembers(u.map(u => u?.identityCommitment))    
    const userIdentity = new Identity(`${address}_${groupId}_${activeUser.name}`)

    const unirepUser = new UnirepUser(userIdentity)
    await unirepUser.updateUserState()
    const userState = await unirepUser.getUserState()
    const epochData = unirepUser.getEpochData()
    let reputationProof = await userState.genProveReputationProof({
      epkNonce: 0,
      minRep: 1,
      graffitiPreImage: 0,
    })

    const fullProof = await generateProof(userIdentity, group, extraNullifier, signal)
    let voteProofData: ReputationProofStruct = {
      publicSignals: epochData.publicSignals,
      proof: epochData.proof,
      publicSignalsQ: reputationProof.publicSignals,
      proofQ: reputationProof.proof,
      ownerEpoch: 0,
      ownerEpochKey: 0,
    }

    try {
      const { status, data } = await votePoll(
        id.toString(),
        groupId,
        pollData,
        fullProof.merkleTreeRoot,
        fullProof.nullifierHash,
        fullProof.proof,
        voteProofData
      )
      if (status === 200) {
        onSuccessCallback(data)
      } else {
        onErrorCallback('Voting Poll failed!')
      }
    } catch (error) {
      onErrorCallback(error)
    }

  }

  return { createPoll, submitPoll }
}

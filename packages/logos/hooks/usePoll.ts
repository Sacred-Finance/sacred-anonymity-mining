import { useActiveUser, useUsers } from '@/contexts/CommunityProvider'
import { createComment, createPost, votePoll } from '@/lib/api'
import { getGroupWithPostAndCommentData, getGroupWithPostData } from '@/lib/fetcher'
import { ItemCreationRequest, PollRequestStruct, PostContent, ReputationProofStruct } from '@/lib/model'
import { UnirepUser } from '@/lib/unirep'
import { createNote, fetchUsersFromSemaphoreContract, getBytes32FromIpfsHash, hashBytes, hashBytes2, uploadIPFS } from '@/lib/utils'
import { Group, Item } from '@/types/contract/ForumInterface'
import { Group as SemaphoreGroup } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import { generateProof } from '@semaphore-protocol/proof'
import { BigNumber } from 'ethers'
import { mutate } from 'swr'
import { useAccount } from 'wagmi'

interface Poll {
  content: PostContent
  pollType: number
  duration: number
  answers: string[]
  rateScaleFrom: number
  rateScaleTo: number
  post?: Item // if post is undefined, it means it's a post, otherwise it's a comment
  onSuccessCallback: () => void
  onErrorCallback: (err) => void
}

interface SubmitPollParams {
  id: any;
  pollData: number[];
  onSuccessCallback: any;
  onErrorCallback: any;
}

export const usePoll = ({  group }: { group: Group }) => {
  const { address } = useAccount()
  const activeUser = useActiveUser({ groupId: group.id })

  const createPoll = async ({
    content,
    pollType,
    duration,
    answers,
    rateScaleFrom,
    rateScaleTo,
    post,
    onSuccessCallback,
    onErrorCallback,
  }: Poll): Promise<any> => {
    try {
      let currentDate = new Date()
      const _message = currentDate.getTime() + '#' + JSON.stringify(content)

      const cid = await uploadIPFS(_message)
      if (!cid) {
        throw 'Upload to IPFS failed'
      }

      const signal = getBytes32FromIpfsHash(cid)
      const extraNullifier = hashBytes(signal).toString()
      const users = await fetchUsersFromSemaphoreContract(group.id)
      let semaphoreGroup = new SemaphoreGroup(group.id)
      users.forEach(u => semaphoreGroup.addMember(BigInt(u)))
      const userIdentity = new Identity(`${address}_${group.id}_${activeUser?.name || 'anon'}`)

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

      const fullProof = await generateProof(userIdentity, semaphoreGroup, extraNullifier, hashBytes(signal))
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

      const { status } =
        post !== undefined
          ? await createComment({
              groupId: group.id.toString(),
              parentId: post.id.toString(),
              request: request,
              solidityProof: fullProof.proof,
              unirepProof: epoch,
              asPoll: true,
              pollRequest: pollRequest,
            })
          : await createPost({
              groupId: group.id.toString(),
              request: request,
              solidityProof: fullProof.proof,
              unirepProof: epoch,
              asPoll: true,
              pollRequest: pollRequest,
            })
      if (status === 200) {
        console.log(`A post posted by user ${address}`)
        if (post !== undefined) {
          await mutate(getGroupWithPostAndCommentData(group.id.toString(), post.id.toString()))
        } else {
          await mutate(getGroupWithPostData(group.id.toString()))
        }
        onSuccessCallback()
      } else {
        onErrorCallback('Creating a post failed!')
        throw new Error('Creating a post failed!')
      }
    } catch (error) {
      onErrorCallback(error)
    }
  }

  const submitPoll = async ({id, pollData, onSuccessCallback, onErrorCallback}: SubmitPollParams) => {
    try {
      const signal = hashBytes2(id, 'votePoll')
      const extraNullifier = signal.toString()
      let semaphoreGroup = new SemaphoreGroup(group.id)
      const users = await fetchUsersFromSemaphoreContract(group.id)
      users.forEach(u => semaphoreGroup.addMember(BigInt(u)))
      const userIdentity = new Identity(`${address}_${group.id}_anon`)

      const unirepUser = new UnirepUser(userIdentity)
      await unirepUser.updateUserState()
      const userState = await unirepUser.getUserState()
      const epochData = unirepUser.getEpochData()
      let reputationProof = await userState.genProveReputationProof({
        epkNonce: 0,
        minRep: 0,
        graffitiPreImage: 0,
      })

      const fullProof = await generateProof(userIdentity, semaphoreGroup, extraNullifier, signal)
      let voteProofData: ReputationProofStruct = {
        publicSignals: epochData.publicSignals,
        proof: epochData.proof,
        publicSignalsQ: reputationProof.publicSignals,
        proofQ: reputationProof.proof,
        ownerEpoch: 0,
        ownerEpochKey: 0,
      }

      const { status, data } = await votePoll(
        id.toString(),
        group.id.toString(),
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

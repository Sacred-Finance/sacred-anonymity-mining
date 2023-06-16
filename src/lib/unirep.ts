import { MemoryConnector } from 'anondb/web'
import { constructSchema } from 'anondb/types'
import { attesterAddress, unirepAddress } from '../constant/const'
import { Contract, Wallet, ethers } from 'ethers'
import { polygonMumbai } from 'wagmi/chains'
import { userUnirepSignUp } from './api'
import { UserState, schema } from '@unirep/core'
import { Identity } from '@semaphore-protocol/identity'
// import { defaultProver as prover } from '@unirep/circuits/provers/defaultProver';
import unirepAbi from '@unirep/contracts/abi/Unirep.json'
import prover from './prover'

export class UnirepUser {
  public identityCommitment = null
  latestTransitionedEpoch
  provableData: bigint[] = []
  reputation = {
    posRep: 0,
    negRep: 0,
    graffiti: 0,
    timestamp: 0,
  }
  provableReputation = {
    posRep: 0,
    negRep: 0,
    graffiti: 0,
    timestamp: 0,
  }
  static user = {
    identity: null,
    userState: null,
    epochData: {
      epoch: null,
      epochKey: null,
      proof: null,
      publicSignals: null,
    },
  }
  static hasSignedUp = false

  provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_MUMBAI_URL, polygonMumbai.id)
  signer = new Wallet(process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY, this.provider)
  unirep = new Contract(unirepAddress, unirepAbi, this.signer)

  constructor(public identity: Identity) {
    if (!UnirepUser.hasSignedUp) {
      this.load()
    }
  }

  async load() {
    // this.userState = await this.genUserState();

    const userState = new UserState(
      {
        provider: this.provider,
        prover,
        unirepAddress: unirepAddress,
        attesterId: BigInt(attesterAddress),
        _id: this.identity,
      },
      this.identity
    )
    console.log('userState', userState)
    await userState.sync.start()
    UnirepUser.user.userState = userState
    console.log('userState', userState)
    await userState.waitForSync()
    // todo: fix this
    // this.latestTransitionedEpoch = await UnirepUser.user.userState.latestTransitionedEpoch()

    UnirepUser.user = {
      ...UnirepUser.user,
      identity: this.identity,
    }

    UnirepUser.hasSignedUp = await userState.hasSignedUp()
    if (!UnirepUser.hasSignedUp) {
      await this.signup()
    } else {
      await this.updateUserEpochKey()
    }
  }

  getUserState() {
    const u = UnirepUser.user
    if (u?.userState && u.userState) {
      return u.userState
    }
    return null
  }
  getEpochData() {
    const u = UnirepUser.user
    return u?.epochData
  }

  // It generate epoch key for the current epoch. It'll be outdated and not available to use once the epoch is ended.
  async updateUserEpochKey() {
    const u = UnirepUser.user
    const nonce = 0
    const userState = this.getUserState()
    await userState.waitForSync()
    if (!u?.epochData) UnirepUser.user.epochData = null
    let epochData = UnirepUser.user.epochData
    const currentEpoch = await this.unirep.attesterCurrentEpoch(attesterAddress)
    if (!epochData || !epochData.epochKey || epochData.epoch < currentEpoch) {
      console.log('Updating Epoch Key:', attesterAddress)
      const { publicSignals, proof, epochKey, epoch } = await userState.genEpochKeyProof({ nonce })
      u.epochData = {
        epoch: epoch,
        epochKey: epochKey,
        proof: proof,
        publicSignals: publicSignals,
      }
    }
  }

  async genUserState() {
    // generate a user state
    const db = new MemoryConnector(constructSchema(schema))

    const attesterId = BigInt(attesterAddress)
    const userState = new UserState(
      {
        db,
        prover,
        unirepAddress,
        provider: this.provider,
        attesterId,
      },
      this.identity
    )

    await userState.sync.start()
    await userState.waitForSync()
    UnirepUser.user.userState = { ...userState }
    return userState
  }

  async userTransition() {
    const userState = this.getUserState()
    await userState.waitForSync()

    //let waitTime = await this.unirep.attesterEpochRemainingTime(attesterAddress)
    //await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    //await this.provider.send('evm_increaseTime', [waitTime.toNumber() + 1])
    //await this.provider.send('evm_mine', [])
    const targetEpoch = await this.unirep.attesterCurrentEpoch(attesterAddress)

    let message = ''
    try {
      const { publicSignals, proof } = await userState.genUserStateTransitionProof({
        toEpoch: targetEpoch,
      }) //toEpoch is a required param

      await (await this.unirep.userStateTransition(publicSignals, proof)).wait()
      await userState.waitForSync()
      await this.updateUserEpochKey()
    } catch (error) {
      if (error instanceof Error) message = error.message
      else message = String(error)
      console.log('Error:', message)
    }
    return message
  }

  async signup() {
    let userState = UnirepUser.user.userState
    if (!UnirepUser.user.userState) {
      userState = await this.genUserState()
    }
    const { publicSignals, proof } = await userState.genUserSignUpProof()
    const response = await userUnirepSignUp(publicSignals, proof)
      .then(res => {
        return res
      })
      .catch(err => {
        console.log('Error:', err)
        return err
      })
    if (response?.status === 200) {
      return await this.updateUserEpochKey()
    } else {
      console.log('Error:', response?.data)
    }
  }

  async updateUserState() {
    let userState = UnirepUser.user.userState
    const currentEpoch = await this.unirep.attesterCurrentEpoch(attesterAddress)
    this.latestTransitionedEpoch = await userState.latestTransitionedEpoch()
    console.log('#######', this.latestTransitionedEpoch, currentEpoch)
    if (this.latestTransitionedEpoch < currentEpoch) {
      await this.userTransition()
    }
  }
}

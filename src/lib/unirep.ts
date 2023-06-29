import { MemoryConnector } from 'anondb/web'
import { constructSchema } from 'anondb/types'
import { attesterAddress, unirepAddress } from '../constant/const'
import { Contract, Wallet, ethers } from 'ethers'
import { polygonMumbai } from 'wagmi/chains'
import { userUnirepSignUp } from './api'
import { UserState, schema } from '@unirep/core'
import { Identity } from '@semaphore-protocol/identity'
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

  provider
  signer
  unirep

  constructor(public identity: Identity) {
    if (!process.env.NEXT_PUBLIC_POLYGON_MUMBAI_URL || !process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY) {
      throw new Error("Environment variables are not set.")
    }
    this.provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_MUMBAI_URL, polygonMumbai.id)
    this.signer = new Wallet(process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY, this.provider)
    this.unirep = new Contract(unirepAddress, unirepAbi, this.signer)

    if (!UnirepUser.hasSignedUp) {
      console.log('User has not signed up yet')
      this.load().catch(console.error)
    } else {
      console.log('User has already signed up')
    }
  }

  async load() {
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

    await userState.sync.start()
    UnirepUser.user.userState = userState
    await userState.waitForSync()
    this.latestTransitionedEpoch = await UnirepUser?.user?.userState?.latestTransitionedEpoch()

    UnirepUser.user.identity = this.identity

    UnirepUser.hasSignedUp = await userState.hasSignedUp()
    if (!UnirepUser.hasSignedUp) {
      await this.signup()
    } else {
      await this.updateUserEpochKey()
    }

    const reputation = await this.fetchReputation()
    console.log(`Reputaion`, reputation)
  }

  getUserState(): UserState {
    return UnirepUser.user.userState
  }

  getEpochData() {
    return UnirepUser.user.epochData
  }

  // It generate epoch key for the current epoch. It'll be outdated and not available to use once the epoch is ended.
  async updateUserEpochKey() {
    const userState = this.getUserState()

    if (!userState) return console.error('User state not found')
    await userState.waitForSync()
    const currentEpoch = await this.unirep.attesterCurrentEpoch(attesterAddress)
    if (!this.getEpochData() || this.getEpochData().epoch < currentEpoch) {
      console.log('Updating Epoch Key:', attesterAddress)
      const { publicSignals, proof, epochKey, epoch } = await userState.genEpochKeyProof({ nonce: 0 })
      UnirepUser.user.epochData = {
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
    UnirepUser.user.userState = userState
    return userState
  }

  async userTransition() {
    const userState = this.getUserState()
    await userState.waitForSync()
    const targetEpoch = await this.unirep.attesterCurrentEpoch(attesterAddress)

    try {
      const { publicSignals, proof } = await userState.genUserStateTransitionProof({ toEpoch: targetEpoch })
      await (await this.unirep.userStateTransition(publicSignals, proof)).wait()
      await userState.waitForSync()
      console.log('User transition Completed:', attesterAddress)
      await this.updateUserEpochKey()
    } catch (error) {
      console.error('Error:', error.message || String(error))
      return error.message || String(error)
    }
  }

  async signup() {
    let userState = UnirepUser.user.userState || await this.genUserState()
    const { publicSignals, proof } = await userState.genUserSignUpProof()
    const { status } = await userUnirepSignUp(publicSignals, proof)

    if (status !== 200) {
      throw new Error('User signup to Unirep failed!')
    }

    return await this.updateUserEpochKey()
  }

  async updateUserState() {
    let userState = this.getUserState()
    const currentEpoch = await this.unirep.attesterCurrentEpoch(attesterAddress)
    this.latestTransitionedEpoch = await userState.latestTransitionedEpoch()
    if (this.latestTransitionedEpoch < currentEpoch) {
      await this.userTransition()
    }
  }

  async fetchReputation() {
    return await UnirepUser.user.userState.getData()
  }
}

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

/**
 * Class representing a Unirep user.
 * Encapsulates user related functionality for Unirep.
 */
export class UnirepUser {
  public identityCommitment: null | unknown = null
  public latestTransitionedEpoch: number | null = null
  public reputationLoaded = false
  public static reputation = {
    posRep: 0,
    negRep: 0,
    graffiti: 0,
    timestamp: 0,
  }

  public provableReputation = {
    posRep: 0,
    negRep: 0,
    graffiti: 0,
    timestamp: 0,
  }
  public provider: ethers.providers.JsonRpcProvider
  public signer: Wallet
  public unirep: Contract
  public provableData: bigint[] = []

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

  /**
   * Creates a UnirepUser.
   * @param identity User's identity.
   */
  constructor(public identity: Identity) {
    if (!process.env.NEXT_PUBLIC_POLYGON_MUMBAI_URL || !process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY) {
      throw new Error('Environment variables are not set.')
    }

    this.provider = new ethers.providers.JsonRpcProvider(
      { url: process.env.NEXT_PUBLIC_POLYGON_MUMBAI_URL },
      polygonMumbai.id
    )
    this.signer = new Wallet(process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY, this.provider)
    this.unirep = new Contract(unirepAddress, unirepAbi, this.signer)

    if (!UnirepUser.hasSignedUp) {
      console.log('User has not signed up yet')
      this.load().catch(console.error)
    } else {
      console.log('User has already signed up')
    }
  }

  /**
   * Load user state and sign up if necessary.
   */
  async load(): Promise<void> {
    const userState = new UserState(
      {
        provider: this.provider,
        prover,
        unirepAddress,
        attesterId: BigInt(attesterAddress),
        _id: this.identity,
      },
      this.identity
    )
    await userState.sync.start()
    UnirepUser.user.userState = userState
    await userState.waitForSync()
    this.latestTransitionedEpoch = await UnirepUser.user.userState.latestTransitionedEpoch()

    UnirepUser.user.identity = this.identity
    UnirepUser.hasSignedUp = await userState.hasSignedUp(BigInt(attesterAddress))

    if (!UnirepUser.hasSignedUp) {
      await this.signup()
    } else {
      await this.updateUserEpochKey()
    }

    const reputation = await this.fetchReputation()
    if (reputation?.posRep !== undefined) {
      UnirepUser.reputation = reputation
    }
  }

  /**
   * Get the user state.
   * @returns User state.
   */
  getUserState(): UserState {
    return UnirepUser.user.userState
  }

  /**
   * Get the epoch data.
   * @returns Epoch data.
   */
  getEpochData() {
    return UnirepUser.user.epochData
  }

  /**
   * Update the epoch key for the user.
   * Note that this key will be outdated once the epoch ends.
   */
  async updateUserEpochKey(): Promise<void> {
    const userState = this.getUserState()

    if (!userState) return console.error('User state not found')
    await userState.waitForSync()
    const currentEpoch = await this.unirep.attesterCurrentEpoch(attesterAddress)

    if (!this.getEpochData() || this.getEpochData().epoch < currentEpoch) {
      console.log('Updating Epoch Key:', attesterAddress)
      const { publicSignals, proof, epochKey, epoch } = await userState.genEpochKeyProof({ nonce: 0 })
      UnirepUser.user.epochData = {
        epoch,
        epochKey,
        proof,
        publicSignals,
      }
    }
  }

  /**
   * Generate a user state.
   * @returns User state.
   */

  async genUserState(): Promise<UserState> {
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

  /**
   * Transition user state to the next epoch.
   * @returns Error message or void.
   */
  async userTransition(): Promise<string | void> {
    console.time('userTransition')
    const userState = this.getUserState()
    await userState.sync.start()
    await userState.waitForSync()
    const targetEpoch = await this.unirep.attesterCurrentEpoch(attesterAddress)

    try {
      const { publicSignals, proof } = await userState.genUserStateTransitionProof({ toEpoch: targetEpoch })
      await (await this.unirep.userStateTransition(publicSignals, proof)).wait()
      await userState.waitForSync()
      await this.updateUserEpochKey()
    } catch (error) {
      console.error('Error:', error.message || String(error))
      console.timeEnd('userTransition')
      return error.message || String(error)
    }
    console.timeEnd('userTransition')
  }

  /**
   * Sign up user to Unirep.
   */
  async signup(): Promise<void> {
    console.time('signup')
    let userState = UnirepUser.user.userState || (await this.genUserState())
    const { publicSignals, proof } = await userState.genUserSignUpProof()
    const { status } = await userUnirepSignUp(publicSignals, proof)

    if (status !== 200) {
      throw new Error('User signup to Unirep failed!')
    }

    await this.updateUserEpochKey()
    console.timeEnd('signup')
  }

  hasReputationLoaded(): boolean {
    return this.reputationLoaded
  }

  /**
   * Update the user state.
   */
  async updateUserState(): Promise<void> {
    let userState = this.getUserState()
    const currentEpoch = await this.unirep.attesterCurrentEpoch(attesterAddress)
    this.latestTransitionedEpoch = await userState.latestTransitionedEpoch()
    if (this.latestTransitionedEpoch < currentEpoch) {
      await this.userTransition()
    }
  }

  /**
   * Fetch the user reputation.
   * @returns Reputation data.
   */
  async fetchReputation(): Promise<Record<string, number>> {
    const repuation = await UnirepUser?.user?.userState?.getData?.()

    if (!repuation) {
      console.error('User state not found')
      return UnirepUser.reputation
    }

    const [posRep, negRep, graffiti, timestamp, somethingElse] = repuation

    const response = {
      posRep: Number(posRep),
      negRep: Number(negRep),
      graffiti: Number(graffiti),
      timestamp: Number(timestamp),
    }

    UnirepUser.reputation = response
    this.reputationLoaded = true

    if (!repuation) return console.error('User state not found')
    return response
  }
}

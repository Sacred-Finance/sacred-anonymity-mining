import { ethers, utils } from 'ethers'
import type { IPFSHTTPClient } from 'ipfs-http-client'
import { create } from 'ipfs-http-client'
import { toBufferBE, toBufferLE } from 'bigint-buffer'
import { buildBabyjub, buildPedersenHash } from 'circomlibjs'
import type { Identity } from '@semaphore-protocol/identity'
import { forumContract, semaphoreContract } from '@/constant/const'
import type { AvatarOptions } from 'animal-avatar-generator'
import type { GroupId } from '@/types/contract/ForumInterface'
import type { BabyJub, PedersenHash } from 'circomlibjs/index'

const { groth16 } = require('snarkjs')

let ipfs: IPFSHTTPClient
let babyJub: BabyJub
let pedersen: PedersenHash

const pedersenHash = (data: Uint8Array) =>
  BigInt(babyJub.F.toString(babyJub.unpackPoint(pedersen.hash(data))[0]))

function unstringifyBigInts(o) {
  if (typeof o == 'string' && /^[0-9]+$/.test(o)) {
    return BigInt(o)
  } else if (typeof o == 'string' && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o)
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts)
  } else if (typeof o == 'object') {
    if (o === null) {
      return null
    }
    const res = {}
    const keys = Object.keys(o)
    keys.forEach(k => {
      res[k] = unstringifyBigInts(o[k])
    })
    return res
  } else {
    return o
  }
}

async function convertProofToSolidityInput(proof, publicSignals) {
  const editedPublicSignals = unstringifyBigInts(publicSignals)
  const editedProof = unstringifyBigInts(proof)
  const calldata = await groth16.exportSolidityCallData(
    editedProof,
    editedPublicSignals
  )
  const argv = calldata
    .replace(/["[\]\s]/g, '')
    .split(',')
    .map(x => BigInt(x).toString())
  const a = [argv[0], argv[1]]
  const b = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ]
  const c = [argv[6], argv[7]]
  return { a, b, c }
}

interface GenerateGroth16ProofParams {
  input: any
  wasmFile?: string
  zkeyFileName?: string
}

export const generateGroth16Proof = async ({
  input,
  wasmFile = '/circuits/VerifyOwner__prod.wasm',
  zkeyFileName = '/circuits/VerifyOwner__prod.0.zkey',
}: GenerateGroth16ProofParams) => {
  const { proof: _proof, publicSignals: _publicSignals } =
    await groth16.fullProve(input, wasmFile, zkeyFileName)
  return await convertProofToSolidityInput(_proof, _publicSignals)
}

export const getContent = async (CID: string) => {
  if (!ipfs) {
    console.log('ipfs not started')
    await startIPFS()
  }
  if (!CID) {
    console.error('no CID')
    return ''
  }
  const decoder = new TextDecoder()
  let content = ''
  console.log(CID + ' loading')

  try {
    for await (const chunk of ipfs.cat(CID)) {
      // chunks of data are returned as a Uint8Array, convert it back to a string
      content += decoder.decode(chunk, { stream: true })
    }
  } catch (error) {
    console.error('error', error)
  }

  console.log(CID + ' loaded')

  const indexMark = content.indexOf('#')
  console.log('indexMark', indexMark)
  if (indexMark >= 0) {
    return content.substring(indexMark + 1)
  }

  console.log('content', content)
  return content
}

export const getIpfsHashFromBytes32 = (bytes32Hex: string): string => {
  if (bytes32Hex === ethers.constants.HashZero) {
    return ''
  }

  console.log('bytes32Hex', bytes32Hex)
  // Add our default ipfs values for first 2 bytes:
  // function:0x12=sha2, size:0x20=256 bits
  // and cut off leading "0x"
  const hashHex = '1220' + bytes32Hex.slice(2)
  const hashBytes = Buffer.from(hashHex, 'hex')
  return utils.base58.encode(hashBytes)
}

export const getBytes32FromIpfsHash = (ipfsListing: string): string => {
  return (
    '0x' +
    Buffer.from(utils.base58.decode(ipfsListing).slice(2)).toString('hex')
  )
}

export const uploadIPFS = async (message: string) => {
  if (!ipfs) {
    return null
  }
  try {
    const result = await ipfs.add(new TextEncoder().encode(message))
    return result.path
  } catch (err) {
    console.error('Error pinning file to IPFS', err)
    return null
  }
}

export const getBytes32FromString = (str: string): string => {
  return ethers.utils.formatBytes32String(str)
}

export const getStringFromBytes32 = (bytes32Hex: string): string => {
  return ethers.utils.parseBytes32String(bytes32Hex)
}

export const uploadImageToIPFS = async (
  message: File
): Promise<string | null> => {
  if (!ipfs || !message) {
    return null
  }
  try {
    const result = await ipfs.add(message)
    console.log('ipfs image upload result', result)
    return result.path
  } catch (err) {
    console.error('Error pinning file to IPFS', err)
    return null
  }
}

export const hashBytes2 = (itemId: number, type: string): bigint => {
  return (
    BigInt(
      utils.keccak256(utils.solidityPack(['uint256', 'string'], [itemId, type]))
    ) >> BigInt(8)
  )
}

export const hashBytes = (signal: string): bigint => {
  return BigInt(utils.keccak256(signal)) >> BigInt(8)
}

export const numToBuffer = (number, size, endianess): Buffer => {
  if (endianess === 'le') {
    return toBufferLE(number, size)
  } else if (endianess === 'be') {
    return toBufferBE(number, size)
  } else {
    console.log("endianess has to be 'le' or 'be'")
    return Buffer.from('')
  }
}

export const createNote = async (identity: Identity): Promise<bigint> => {
  const trapdoor: bigint = identity.getTrapdoor()
  const nullifier: bigint = identity.getNullifier()
  const trapdoorBuffer: Buffer = numToBuffer(trapdoor, 32, 'le')
  const image: Buffer = Buffer.concat([
    trapdoorBuffer,
    numToBuffer(nullifier, 32, 'le'),
  ])

  if (!babyJub) {
    babyJub = await buildBabyjub()
  }

  if (!pedersen) {
    pedersen = await buildPedersenHash()
  }

  return pedersenHash(image)
}

export const createInputNote = async (identity: Identity) => {
  const note = await createNote(identity)
  const trapdoor = identity.getTrapdoor()
  const nullifier = identity.getNullifier()
  return { note, trapdoor, nullifier }
}

export const startIPFS = async () => {
  if (ipfs) {
    return ipfs
  }

  try {
    const auth =
      'Basic ' +
      Buffer.from(
        process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID +
          ':' +
          process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET
      ).toString('base64')

    ipfs = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth,
      },
    })
  } catch (error) {
    console.error('Error starting IPFS:', error)
    throw error // Or handle the error as you see fit
  }
}

export const commentIsConfirmed = (id: string) => {
  // if confirmed, the id is an  integer stored in the contract instead of just an ipfs hash
  if (/^\d+$/.test(id)) {
    return true
  } else {
    return false
  }
}

export const parseComment = (content: string) => {
  let parsedContent
  try {
    parsedContent = JSON.parse(content)
  } catch (error) {
    parsedContent = {
      title: content,
      description: '',
    }
  }
  return parsedContent
}

export const parsePost = content => {
  let parsedPost
  try {
    if (typeof content == 'string') {
      parsedPost = JSON.parse(content)
    } else {
      return content
    }
  } catch (error) {
    parsedPost = {
      title: content,
      description: '',
    }
  }
  return parsedPost
}

interface UserJoined {
  groupId: bigint
  identityCommitment: bigint
}

export const hasUserJoined = async ({
  groupId,
  identityCommitment,
}: UserJoined) => {
  try {
    return await forumContract.read.isMemberJoined([
      groupId,
      identityCommitment,
    ])
  } catch (error) {
    console.log(error)
    return false
  }
}

export const fetchUsersFromSemaphoreContract = async (groupId: GroupId) => {
  console.log('fetching users from semaphore contract', groupId)
  return semaphoreContract?.getGroupMembers(groupId.toString())
}

export const generateAvatar = async (seed: string, options: AvatarOptions) => {
  const avatar = (await import('animal-avatar-generator')).default
  return avatar(seed, { size: 200, ...options })
}
export const HashZero =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

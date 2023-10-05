import axios from 'axios'
import { ethers, utils } from 'ethers'
import { create, IPFSHTTPClient } from 'ipfs-http-client'
import { toBufferBE, toBufferLE } from 'bigint-buffer'
import { buildBabyjub, buildPedersenHash } from 'circomlibjs'
import { Identity } from '@semaphore-protocol/identity'

const groth16 = require('snarkjs').groth16

let ipfs: IPFSHTTPClient
let babyJub, pedersen

const gatewayURL = 'https://ipfs.io/ipfs'

const pedersenHash = data => BigInt(babyJub.F.toString(babyJub.unpackPoint(pedersen.hash(data))[0]))

function unstringifyBigInts(o) {
  if (typeof o == 'string' && /^[0-9]+$/.test(o)) {
    return BigInt(o)
  } else if (typeof o == 'string' && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o)
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts)
  } else if (typeof o == 'object') {
    if (o === null) return null
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
  const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals)
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

export const generateGroth16Proof = async (input, wasmFile, zkeyFileName) => {
  const { proof: _proof, publicSignals: _publicSignals } = await groth16.fullProve(input, wasmFile, zkeyFileName)
  return await convertProofToSolidityInput(_proof, _publicSignals)
}

export const getPublicSignals = async (input, wasmFile, zkeyFileName) => {
  try {
    console.log('input', input)
    const { publicSignals } = await groth16.fullProve(input, wasmFile, zkeyFileName)
    console.log('publicSignals', publicSignals)
    return publicSignals
  } catch (error) {
    console.error(error)
  }
}
export const getContent2 = async (CID: string) => {
  console.log(CID + ' loading')

  return axios.get(`${gatewayURL}/${CID}`).then(({ data }) => {
    const indexMark = data.indexOf('#')
    console.log(CID + ' loaded')
    if (indexMark >= 0) {
      return data.substring(indexMark + 1)
    }
    return ''
  })
}

export const getContent = async (CID: string) => {
  if (!ipfs) {
    console.log('ipfs not started')
    await startIPFS()
  }
  if (!CID) return ''
  const decoder = new TextDecoder()
  let content = ''
  console.log(CID + ' loading')

  try {
    for await (const chunk of ipfs.cat(CID)) {
      // chunks of data are returned as a Uint8Array, convert it back to a string
      content += decoder.decode(chunk, { stream: true })
    }
  } catch (error) {
    console.log(error)
  }

  console.log(CID + ' loaded')

  const indexMark = content.indexOf('#')
  if (indexMark >= 0) {
    return content.substring(indexMark + 1)
  }
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
  const hashStr = utils.base58.encode(hashBytes)
  return hashStr
}

export const getBytes32FromIpfsHash = (ipfsListing: string): string => {
  return '0x' + Buffer.from(utils.base58.decode(ipfsListing).slice(2)).toString('hex')
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

export const uploadImageToIPFS = async (message: File): Promise<string | null> => {
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

export const hashBytes2 = (itemId: number, type: string): BigInt => {
  return BigInt(utils.keccak256(utils.solidityPack(['uint256', 'string'], [itemId, type]))) >> BigInt(8)
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

// export const createNote = async (cid: BigInt, identity:BigInt) => {
//   const cidBuffer = numToBuffer(cid, 32, 'le')
//   const image = Buffer.concat([cidBuffer, numToBuffer(identity, 32, 'le')])
//   if(!babyJub) {
//     babyJub = await buildBabyjub()
//   }
//   if(!pedersen)
//     pedersen = await buildPedersenHash();
//   return pedersenHash(image)
// }

// note is a Buffer of 64 bytes based on the identity of the user or the content
export const createNote = async (identity: Identity) => {
  const trapdoor = identity.getTrapdoor() //getTrapDoor is not a function, error on posting a comment
  const nullifier = identity.getNullifier()
  const trapdoorBuffer = numToBuffer(trapdoor, 32, 'le')
  const image = Buffer.concat([trapdoorBuffer, numToBuffer(nullifier, 32, 'le')])
  if (!babyJub) babyJub = await buildBabyjub()
  if (!pedersen) pedersen = await buildPedersenHash()
  return pedersenHash(image)
}
export const createInputNote = async (identity: Identity) => {
  const trapdoor = identity.getTrapdoor() //getTrapDoor is not a function, error on posting a comment
  const nullifier = identity.getNullifier()
  const trapdoorBuffer = numToBuffer(trapdoor, 32, 'le')
  const image = Buffer.concat([trapdoorBuffer, numToBuffer(nullifier, 32, 'le')])
  if (!babyJub) babyJub = await buildBabyjub()
  if (!pedersen) pedersen = await buildPedersenHash()
  return { note: pedersenHash(image), trapdoor: trapdoor, nullifier: nullifier }
}

export const startIPFS = async () => {
  if (ipfs) {
    return ipfs
  }

  try {
    const auth =
      'Basic ' +
      Buffer.from(
        process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID + ':' + process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET
      ).toString('base64')

    ipfs = await create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth,
      },
    })

    return ipfs
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

export const postIsConfirmed = id => {
  // if confirmed, the id is an integer/object stored in the contract instead of just an ipfs hash
  if (/^\d+$/.test(id)) {
    return true
  } else {
    return false
  }
}

export const parseComment = content => {
  let parsedContent
  try {
    if (typeof content == 'string') {
      parsedContent = JSON.parse(content)
    } else {
      return content
    }
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

export const sortArray = (array: [], prop: string, asc: boolean) => {
  const sort = asc ? -1 : 1
  return array.sort((a, b) => {
    if (a[prop] < b[prop]) {
      return -1 * sort
    }
    if (a[prop] > b[prop]) {
      return 1 * sort
    }
    return 0
  })
}

export const removeDuplicates = (array, prop: string) => {
  let set = new Set()
  return array.filter(obj => {
    let key = obj[prop]
    let isNew = !set.has(key)
    set.add(key)
    return isNew
  })
}

export function formatDistanceToNow(date) {
  const now = new Date()
  // @ts-ignore
  const diffInSeconds = Math.floor((now - date) / 1000)

  let prefix = ''
  let suffix = ''
  let value = ''

  if (now > date) {
    prefix = 'about'
    suffix = 'ago'
  } else if (now < date) {
    prefix = 'in about'
  }

  if (diffInSeconds < 60) {
    value = `${diffInSeconds} seconds`
  } else if (diffInSeconds < 3600) {
    value = `${Math.floor(diffInSeconds / 60)} minutes`
  } else if (diffInSeconds < 86400) {
    value = `${Math.floor(diffInSeconds / 3600)} hours`
  } else if (diffInSeconds < 2592000) {
    value = `${Math.floor(diffInSeconds / 86400)} days`
  } else if (diffInSeconds < 31536000) {
    value = `${Math.floor(diffInSeconds / 2592000)} months`
  } else {
    value = `${Math.floor(diffInSeconds / 31536000)} years`
  }

  return `${prefix} ${value} ${suffix}`.trim()
}

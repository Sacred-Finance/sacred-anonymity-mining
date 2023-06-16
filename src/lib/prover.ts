const snarkjs = require('snarkjs')
import { SnarkPublicSignals, SnarkProof } from '@unirep/utils'
import { Circuit } from '@unirep/circuits'

export default {
  verifyProof: async (circuitName: string | Circuit, publicSignals: SnarkPublicSignals, proof: SnarkProof) => {
    const vkey = await fetch(`/circuits/${circuitName}.vkey.json`)
    return snarkjs.groth16.verify(vkey, publicSignals, proof)
  },
  genProofAndPublicSignals: async (circuitName: string | Circuit, inputs: any) => {
    const wasm = await fetch(`/circuits/${circuitName}.wasm`).then(r => {
      return r.arrayBuffer()
    })
    const zkey = await fetch(`/circuits/${circuitName}.zkey`).then(r => {
      return r.arrayBuffer()
    })
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, new Uint8Array(wasm), new Uint8Array(zkey))
    return { proof, publicSignals }
  },
  /**
   * Get vkey from default built folder `zksnarkBuild/`
   * @param name Name of the circuit, which can be chosen from `Circuit`
   * @returns vkey of the circuit
   */
  getVKey: async (name: string | Circuit) => {
    // return require(path.join(buildPath, `${name}.vkey.json`))
  },
}

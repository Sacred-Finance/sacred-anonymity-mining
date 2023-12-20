import { SnarkPublicSignals, SnarkProof } from '@unirep/utils'
import { Circuit } from '@unirep/circuits'
const groth16 = require('snarkjs').groth16

export default {
  cachedVkeys: {},

  verifyProof: async (circuitName: string | Circuit, publicSignals: SnarkPublicSignals, proof: SnarkProof) => {
    console.log(`Verifying proof for ${circuitName} -- checking if vkey is cached`)
    if (!this.cachedVkeys[circuitName]) {
      console.log(`Verifying proof for ${circuitName} -- fetching vkey from server`)
      this.cachedVkeys[circuitName] = await fetch(`/circuits/${circuitName}.vkey.json`)
    }
    console.log(`Verifying proof for ${circuitName} -- vkey cached, verifying proof`)
    return groth16.verify(this.cachedVkeys[circuitName], publicSignals, proof)
  },
  genProofAndPublicSignals: async (circuitName: string | Circuit, inputs: any) => {
    console.log(`Generating proof for ${circuitName}`)
    const [wasm, zkey] = await Promise.all([
      fetch(`/circuits/${circuitName}.wasm`).then(r => r.arrayBuffer()),
      fetch(`/circuits/${circuitName}.zkey`).then(r => r.arrayBuffer()),
    ])
    console.log(`Generating proof for ${circuitName} -- proving`)
    const { proof, publicSignals } = await groth16.fullProve(inputs, new Uint8Array(wasm), new Uint8Array(zkey))
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

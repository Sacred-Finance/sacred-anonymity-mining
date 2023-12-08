export const fetchTokenInfo = async contract => {
  try {
    const [symbol, name, decimals] = await Promise.all([
      contract.symbol(),
      contract.name(),
      contract.decimals(),
    ])
    return { symbol, name, decimals }
  } catch (error) {
    console.error('error', error)
    return { symbol: 'Unidentified Token', name: 'Unidentified Token' }
  }
}

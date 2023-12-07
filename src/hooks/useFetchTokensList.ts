import { useEffect, useState } from 'react'
import axios from 'axios'
import { isAddress } from 'ethers/lib/utils.js'
import { groupBy } from 'lodash'

export const useFetchTokensList = (chainId: number) => {
  const [mappedTokensList, setMappedTokensList] = useState({})
  const [filteredTokensList, setFilteredTokensList] = useState<any>([])

  useEffect(() => {
    fetchTokensList().then(data => {
      const groupedData = groupBy(data?.tokens, 'chainId')
      setMappedTokensList(groupedData)
      setFilteredTokensList(groupedData[chainId])
    })
  }, [])

  useEffect(() => {
    if (chainId && mappedTokensList[chainId]) {
      setFilteredTokensList(mappedTokensList[chainId])
    }
  }, [chainId])

  const filterByKey = (key: string, value: string) => {
    const filteredTokens = mappedTokensList[chainId]?.filter((token: any) => {
      return token[key].toLowerCase().includes(value?.toLowerCase())
    })
    console.log(filteredTokens)
    setFilteredTokensList(filteredTokens)
  }

  const onSearch = searchTerm => {
    console.log(searchTerm)
    if (isAddress(searchTerm)) {
      filterByKey('address', searchTerm)
    } else if (searchTerm) {
      filterByKey('name', searchTerm)
    } else {
      setFilteredTokensList(mappedTokensList[chainId])
    }
  }

  const fetchTokensList = async () => {
    return (await axios.get('https://gateway.ipfs.io/ipns/tokens.uniswap.org')).data
  }

  return { filteredTokensList, onSearch }
}

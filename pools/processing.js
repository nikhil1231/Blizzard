import { makePairName, addAddressSymbolMap } from './utils.js'

export const createCache = (dataSets, dexes, maxPairs) => {
  // cache[DEX][PAIR]{INFO}
  const cache = {}
  for (const i in dataSets) {
    cache[dexes[i]] = {}
    for (const pair of dataSets[i].slice(0, maxPairs)) {
      delete pair.hourData
      const p1 = pair.token0.symbol
      const p2 = pair.token1.symbol
      const a1 = pair.token0.id
      const a2 = pair.token1.id

      addAddressSymbolMap(pair.token0.id, p1)
      addAddressSymbolMap(pair.token1.id, p2)

      pair.dex = dexes[i]

      cache[dexes[i]][makePairName(a1, a2)] = pair
      cache[dexes[i]][makePairName(a2, a1)] = pair
    }
  }
  return cache
}

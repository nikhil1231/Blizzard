
export const DEX_INFO = {
  JOE: {
    path: './data/tj_pairs.json',
    fee: 0.003,
  },
  PNG: {
    path: './data/p_pairs.json',
    fee: 0.003,
  },
}

export const DEXES = Object.keys(DEX_INFO)

export const encodeVertex = (symbol, dex) => dex + "_" + symbol

export const decodeVertex = (str) => [str.slice(0,3), str.slice(4, str.length)]

export const makePairName = (p1, p2) => `${p1}-${p2}`

export const addressSymbolMap = {}
export const addAddressSymbolMap = (addr, symbol) => addressSymbolMap[addr] = symbol


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

export const encodeVertex = (symbol, dex) => dex + "_" + symbol

export const decodeVertex = (str) => [str.slice(0,3), str.slice(4, str.length)]
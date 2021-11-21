

export const encodeVertex = (symbol, dex) => dex + "_" + symbol

export const decodeVertex = (str) => [str.slice(0,3), str.slice(4, str.length)]
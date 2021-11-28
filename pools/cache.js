import { makePairName } from './utils.js'

export class Cache {
  constructor(metadata, maxPairs) {
    this._cache = {}
    this._addressMap = {}
    this._lps = []
    this._lp_mapping = {}

    for (const [dex, pairs] of Object.entries(metadata)) {
      this._cache[dex] = {}

      for (const pair of pairs.slice(0, maxPairs)) {
        const p1 = pair.token0.symbol
        const p2 = pair.token1.symbol
        const a1 = pair.token0.id
        const a2 = pair.token1.id

        this.addAddressSymbolMap(pair.token0.id, p1)
        this.addAddressSymbolMap(pair.token1.id, p2)

        const pairName = makePairName(a1, a2)

        this._lps.push(pair.id)
        this._lp_mapping[pair.id] = {
          dex,
          pairName
        }

        pair.dex = dex

        this._cache[dex][pairName] = pair
      }
    }
  }

  get(dex, t0, t1) {
    return this._cache[dex][makePairName(t0, t1)]
  }

  enumerate() {
    const res = []
    for (const [dex, pairs] of Object.entries(this._cache)) {
      for (const pair of Object.values(pairs)) {
        res.push([dex, pair])
      }
    }
    return res
  }

  addAddressSymbolMap(addr, symbol) {
    this._addressMap[addr] = symbol
  }

  getSymbol(addr) {
    return this._addressMap[addr]
  }

  getAddresses() {
    return Object.keys(this._addressMap)
  }

  getLPs() {
    return this._lps
  }

  updateReserves(reserveList) {
    for (let i = 0; i < reserveList.length; i++){
      const lp = this._lps[i]
      const mapping = this._lp_mapping[lp]
      const [r0, r1] = reserveList[i]
      this._cache[mapping.dex][mapping.pairName].reserve0 = r0
      this._cache[mapping.dex][mapping.pairName].reserve1 = r1
    }
  }
}

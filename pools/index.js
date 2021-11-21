import { getPairs } from './request.js';
import { existsSync, readFileSync, writeFileSync } from "fs";
import { getCycles } from './graph.js'
import { decodeVertex } from './utils.js';

const DEX_INFO = {
  JOE: {
    path: './data/tj_pairs.json',
    fee: 0.003,
  },
  PNG: {
    path: './data/p_pairs.json',
    fee: 0.003,
  },
}

const DEXES = Object.keys(DEX_INFO)
const DEX_I = {}
for (const i in DEXES) {
  DEX_I[DEXES[i]] = i
}

const getData = async (dex) => {
  var pairsData
  if (existsSync(DEX_INFO[dex].path)) {
    pairsData = JSON.parse(readFileSync(DEX_INFO[dex].path))
  } else {
    pairsData = await getPairs(dex)()
    writeFileSync(DEX_INFO[dex].path, JSON.stringify(pairsData))
  }
  return pairsData.data.pairs
}

const processPairs = (oldPairs, dex) => {
  const pairs = {}
  for (const pair of oldPairs) {
    const t0 = pair.token0.symbol
    const t1 = pair.token1.symbol
    if (!(t0 in pairs)) {
      pairs[t0] = {}
    }
    if (!(t1 in pairs)) {
      pairs[t1] = {}
    }
    pairs[t0][t1] = pair.token0Price
    pairs[t1][t0] = pair.token1Price
  }
  return { pairs, dex }
}

const cycleToActions = (cycle) => {
  const c = cycle.map((x, i) => {
    if (i > 0) {
      const from = decodeVertex(cycle[i - 1])[1]
      const [dex, to] = decodeVertex(x)
      return { from, to, dex }
    }
  })
  c.shift()
  return c.filter(a => a.from != a.to);
}

const getProfit = (actions, priceSets) => actions.reduce((acc, action) => acc * priceSets[DEX_I[action.dex]].pairs[action.from][action.to], 1);

const createGraph = async (dataSets) => {

  const priceSets = dataSets.map(pairs => pairs.slice(0, 500))
    .map((pairs, i) => processPairs(pairs, DEXES[i]))

  const cycles = getCycles("WAVAX", priceSets, DEXES)

  console.log(cycles)

  for (const cycle of cycles) {
    const actions = cycleToActions(cycle)

    console.log(actions)

    console.log(getProfit(actions, priceSets))
  }

}

const dataCalls = DEXES.map(dex => getData(dex))

const dataSets = await Promise.all(dataCalls)

const graph = await createGraph(dataSets)


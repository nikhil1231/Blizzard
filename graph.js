import { DEXES, MAX_BN, encodeVertex, decodeVertex, getAmountOut, makePairName, getAmountsOut } from './utils.js';
import { MIN_A0, MIN_LIQUIDITY, MAX_CYCLE_LENGTH } from './config.js';

export class Edge {
  constructor(e, v, weight) {
    this.to = v;
    this.weight = weight;
    this.from = e;
  }
};

export const constructGraph = (cache) => {

  const graph = {}

  const addEdge = (v0, v1, r0, r1, sameCoin = false) => {
    if (!(v0 in graph)) {
      graph[v0] = {}
    }
    if (!(v1 in graph)) {
      graph[v1] = {}
    }

    graph[v0][v1] = {
      r0,
      r1,
      sameCoin
    }

    graph[v1][v0] = {
      r1: r0,
      r0: r1,
      sameCoin
    }
  }

  for (const [dex, pair] of cache.enumerate()) {
    const v0 = encodeVertex(pair.token0.id, dex)
    const v1 = encodeVertex(pair.token1.id, dex)

    addEdge(v0, v1, pair.reserve0, pair.reserve1)
  }

  const vertices = DEXES.map(dex => cache.getAddresses().map(addr => encodeVertex(addr, dex))).flat()

  // Unit edge between same coin, different exchanges
  for (const v0 of vertices) {
    const [d1, a1] = decodeVertex(v0)
    for (const v1 of vertices) {
      const [d2, a2] = decodeVertex(v1)
      if (a1 == a2 && d1 != d2) {
        addEdge(v0, v1, MAX_BN, MAX_BN, true)
      }
    }
  }

  return graph
}

const dfs = (graph, v, cycle, cycles, visited, source, i, lastReturn, lastLiq, lastPrice, lowestLiq) => {
  if (i == 0) return

  const newCycle = [...cycle, v]

  const addr = decodeVertex(v)[1]
  if (newCycle.length > 2 && addr == source) {
    cycles.push({
      cycle: newCycle,
      lastReturn,
      lowestLiq
    })
    return
  }

  const edges = graph[v]
  for (const [newV, info] of Object.entries(edges)) {
    const newAddr = decodeVertex(newV)[1]
    if (visited.includes(makePairName(addr, newAddr))) {
      continue
    }

    const currentPrice = info.r1 / info.r0
    const currentLiq = info.sameCoin ? lastLiq : lastPrice * info.r0

    const newVisited = [...visited, makePairName(addr, newAddr)]
    const nextReturn = info.sameCoin ? lastReturn : getAmountOut(lastReturn, info.r0, info.r1)
    const nextPrice = info.sameCoin ? lastPrice : lastPrice * currentPrice
    dfs(graph, newV, newCycle, cycles, newVisited, source, info.sameCoin ? i : i - 1,
      nextReturn, info.r1, nextPrice, currentLiq < lowestLiq ? currentLiq : lowestLiq)
  }
}

export const findCycles = (graph, source) => {
  const cycles = []
  dfs(graph, encodeVertex(source, DEXES[0]), [], cycles, [], source, MAX_CYCLE_LENGTH, MIN_A0, 1, 1, MAX_BN)
  return cycles
};

export const filterCycles = (cycles) => {
  return cycles.filter(c => c.lastReturn.gte(MIN_A0))
    .filter(c => c.lowestLiq > MIN_LIQUIDITY)
}

export const getCycles = (source, cache) => {

  const graph = constructGraph(cache, cache.getAddresses())

  const cycles = findCycles(graph, source)

  const filteredCycles = filterCycles(cycles)

  return filteredCycles
}
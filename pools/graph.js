import { DEXES, encodeVertex, decodeVertex, getAmountOut } from './utils.js';

export class Edge {
  constructor(e, v, weight) {
    this.to = v;
    this.weight = weight;
    this.from = e;
  }
};

const createEdge = (dex, t0, t1, p) => {
  return new Edge(encodeVertex(t0, dex), encodeVertex(t1, dex), -Math.log(p))
}

const createEdges = (dex, pair) => {
  const priceWithfee0 = getAmountOut(1, pair.reserve1, pair.reserve0)
  const priceWithfee1 = getAmountOut(1, pair.reserve0, pair.reserve1)
  return [
    createEdge(dex, pair.token0.id, pair.token1.id, priceWithfee1),
    createEdge(dex, pair.token1.id, pair.token0.id, priceWithfee0),
  ]
}

export const constructGraphParams = (cache, tokenAddresses) => {
  const vertices = DEXES.map(dex => tokenAddresses.map(addr => encodeVertex(addr, dex))).flat()
  const edges = []

  for (const [dex, pair] of cache.enumerate()) {
    edges.push(...createEdges(dex, pair))
  }

  // Unit edge between same coin, different exchanges
  for (const v1 of vertices) {
    const [d1, s1] = decodeVertex(v1)
    for (const v2 of vertices) {
      const [d2, s2] = decodeVertex(v2)
      if (s1 == s2 && d1 != d2) {
        edges.push(new Edge(v1, v2, 0))
      }
    }
  }

  return [vertices, edges]
}

export const bellmanFord = (vertices, edges, sources) => {
  const d = {};
  const parents = {};
  for (const v of vertices) {
    d[v] = Infinity;
    parents[v] = null;
  }

  for (const source of sources) {
    d[source] = 0;
  }

  for (let i = 0; i < vertices.length - 1; i++) {
    for (const e of edges) {
      // Bellman-Ford relaxation
      if (d[e.from] + e.weight < d[e.to]) {
        d[e.to] = d[e.from] + e.weight;
        parents[e.to] = e.from;
      }
    }
  }
  return [d, parents]
}

export const findCycles = (vertices, edges, d, parents) => {

  // Find cycles if they exist
  let allCycles = [];
  const seen = {};

  for (const e of edges) {
    if (seen[e.to])
      continue;
    // If we can relax further there must be a neg-weight cycle
    if (d[e.from] + e.weight < d[e.to]) {
      let cycle = [];
      let x = e.to;
      while (1) {
        // Walk back along parents until a cycle is found
        seen[e.to] = true;
        cycle.push(x);
        x = parents[x];
        if (x == e.to || cycle.includes(x))
          break;
      }
      // Slice to get the cyclic portion
      const idx = cycle.indexOf(x);
      cycle.push(x);
      cycle = cycle.slice(idx).reverse()
      allCycles.push(cycle);
    }
  }

  // Remove duplicate cycles
  allCycles = allCycles.filter((a, i) => {
    let res = true;
    for (var j = i, l = allCycles.length; j < l; j++) {
      const b = allCycles[j]
      if (a != b && a.every(x => b.includes(x)))
        res = false;
    }
    return res;
  }).map((cycle) => cycle.filter((x, i) => {
    // Remove same-coin switches
    return !i || Math.abs(x - cycle[i - 1]) != vertices.length
  }))

  return allCycles;
};

export const getCycles = (source, cache) => {

  const [vertices, edges] = constructGraphParams(cache, cache.getAddresses())

  const [dists, parents] = bellmanFord(vertices, edges, DEXES.map(dex => encodeVertex(source, dex)))

  return findCycles(vertices, edges, dists, parents)
}
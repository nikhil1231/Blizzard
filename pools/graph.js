import { encodeVertex, decodeVertex } from './utils.js';

class Edge {
  constructor(e, v, weight) {
    this.to = v;
    this.weight = weight;
    this.from = e;
  }
};

const bellmanFord = (vertices, edges, sources) => {
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
      // cycle.slice(idx);
      // cycle.shift();
      cycle = cycle.slice(idx).reverse()
      // cycle.pop();
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

export const getCycles = (source, priceSets, dexes) => {

  const vertices = priceSets.map(set => Object.keys(set.pairs).map(symbol => encodeVertex(symbol, set.dex))).flat()
  const edges = [];

  for (const priceSet of priceSets) {
    for (const [t1, t2s] of Object.entries(priceSet.pairs)) {
      for (const [t2, price] of Object.entries(t2s)) {
        edges.push(new Edge(encodeVertex(t1, priceSet.dex), encodeVertex(t2, priceSet.dex), -Math.log(price)))
      }
    }
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

  return bellmanFord(vertices, edges, dexes.map(dex => encodeVertex(source, dex)))
}
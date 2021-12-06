import { getCycles } from './graph.js'
import { decodeVertex } from './utils.js';

const cycleToActions = (cycle, source, cache) => {
  const c = cycle.map((x, i) => {
    if (i > 0) {
      const from = decodeVertex(cycle[i - 1])[1]
      const [dex, to] = decodeVertex(x)
      const lp = from == to ? "" : cache.get(dex, from, to).id
      return { from, to, dex, lp }
    }
  })
  c.shift()
  while (c[0].from != source) {
    c.push(c.shift())
  }
  return c.filter(a => a.from != a.to);
}

export const getArbActions = async (cache, source) => {

  const cycles = getCycles(source, cache)

  if (cycles.length == 0) {
    return []
  }

  console.log(cycles);

  const actions = cycleToActions(cycles[0].cycle, source, cache)

  // TODO: maybe add profit calculation here?

  return actions
}
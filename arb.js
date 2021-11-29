import { getCycles } from './graph.js'
import { decodeVertex } from './utils.js';

const cycleToActions = (cycle, source) => {
  const c = cycle.map((x, i) => {
    if (i > 0) {
      const from = decodeVertex(cycle[i - 1])[1]
      const [dex, to] = decodeVertex(x)
      return { from, to, dex }
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

  const actions = cycleToActions(cycles[0], source)

  // TODO: maybe add profit calculation here?

  return actions
}
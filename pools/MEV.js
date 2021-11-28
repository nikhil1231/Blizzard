import { makePairName } from './utils.js'

const INITIAL_A0 = 10
const LR = 10
const MIN_DIFF = 0.001

const getAmountOut = (a, r1, r2) => {
  const af = 997 * a
  return (af * r2) / (1000 * r1 + af)
}

const getAmountsOut = (a0, lps) => {
  const amounts = [a0]
  for (const lp of lps) {
    amounts.push(getAmountOut(amounts[amounts.length - 1], lp[0], lp[1]))
  }
  return amounts
}

export const getAmountsOutProfit = (a0, lps) => {
  const amounts = getAmountsOut(a0, lps)
  amounts.push(amounts[amounts.length - 1] - a0)
  return amounts
}

const dait_dai = (ai, r1, r2) => {
  const d = (1e3 * r1 + 997 * ai)
  return (997 * 1e3 * r1 * r2) / (d * d)
}

const getGradient = (out, lps) => {

  let dan_da0 = 1
  for (let i = 0; i < out.length - 2; i++) {
    dan_da0 *= dait_dai(out[i], ...lps[i])
  }

  const dh_da0 = dan_da0 - 1

  return dh_da0
}

export const gradientDescent = (lps) => {
  let a0 = INITIAL_A0;
  let diff = Infinity
  let maxIters = 1000
  let out
  while (Math.abs(diff) > MIN_DIFF && maxIters > 0) {
    out = getAmountsOutProfit(a0, lps)
    const grad = getGradient(out, lps)

    diff = grad * LR
    a0 += diff

    maxIters--
  }

  return [a0, out[out.length - 2]]
}

export const calculateOptimumInput = (actions, cache, maxA0) => {
  const lps = []
  for (const action of actions) {
    const pair = cache.get(action.dex, action.from, action.to)
    const reserves = pair.token0.id == action.from
      ? [pair.reserve0, pair.reserve1]
      : [pair.reserve1, pair.reserve0]
    lps.push(reserves)
  }
  const out = getAmountsOutProfit(maxA0, lps)
  if (getGradient(out, lps) > 0) {
    return [maxA0, out[out.length - 2]]
  }

  return gradientDescent(lps)
}
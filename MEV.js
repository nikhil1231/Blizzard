import { ethers } from "ethers"
import { getAmountsOut } from "./utils.js"
import { MAX_A0 } from "./config.js"

const INITIAL_A0 = ethers.utils.parseEther("10")
const LR = 10
const MIN_DIFF = 0.001

export const getAmountsOutProfit = (a0, lps) => {
  const amounts = getAmountsOut(a0, lps)
  amounts.push(amounts[amounts.length - 1].sub(a0))
  return amounts
}

const dait_dai = (ai, r1, r2) => {
  const x = ai.mul(997)
  const d = r1.mul(1000).add(x)
  const numerator = r1.mul(r2).mul(997 * 1e3)
  const denominator = d.mul(d)
  return numerator.div(denominator)
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
    a0.add(diff)

    maxIters--
  }

  return [a0, out[out.length - 2], out[out.length - 1]]
}

export const calculateOptimumInput = (actions, cache) => {
  const lps = []
  for (const action of actions) {
    const pair = cache.get(action.dex, action.from, action.to)
    const reserves = pair.token0.id == action.from
      ? [pair.reserve0, pair.reserve1]
      : [pair.reserve1, pair.reserve0]
    lps.push(reserves)
  }

  const out = getAmountsOutProfit(MAX_A0, lps)
  if (getGradient(out, lps) > 0) {
    return [MAX_A0, out[out.length - 2], out[out.length - 1]]
  }

  return gradientDescent(lps)
}
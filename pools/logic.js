import { makePairName, getAmountsOut } from './utils.js'

const INITIAL_A0 = 10
const LR = 10
const MIN_DIFF = 0.001


const getAmountsOutProfit = (a0, lps) => {
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

const gradientDescent = (lps) => {
  let a0 = INITIAL_A0;
  let diff = Infinity
  let maxIters = 1000
  while (Math.abs(diff) > MIN_DIFF && maxIters > 0) {
    const out = getAmountsOutProfit(a0, lps)
    const grad = getGradient(out, lps)

    diff = grad * LR
    a0 += diff

    maxIters--
  }

  return a0
}

export const calculateMEV = (actions, data) => {
  const lps = []
  for (const action of actions) {
    const pair = data[action.dex][makePairName(action.from, action.to)]
    const reserves = pair.token0.symbol == action.from
      ? [pair.reserve0, pair.reserve1]
      : [pair.reserve1, pair.reserve0]
    lps.push(reserves)
    console.log(pair);
  }
  console.log(lps);

  // const lps = [
  //   [1e10, 2e10],
  //   [2e2, 10e2],
  //   [10e10, 1.1e10],
  // ]

  // const lps = [
  //   [1052473.126801070592827232, 117293337.258154],
  //   [150046.636477, 5.084193134524740585],
  //   [14.600005026906668977, 427815.766268029687642197],
  //   [115795.876855800249373396, 8467.001026530670876582],
  //   [9130.249759420878991681, 1104.594372150006510305]
  // ]

  // const lps = [
  //   [170000, 19000000],
  //   [1800000, 2000],
  //   [40000, 700]
  // ]

  // Can we have negative gradients at 0? (check test_liq.py),
  // what does it mean?
  // if not, do a pre-check of gradient at 0.


  console.log(gradientDescent(lps))
}
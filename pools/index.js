import { getData } from './request.js';
import { createCache } from './processing.js';
import { DEXES, addressSymbolMap } from './utils.js';
import { getArbActions } from './arb.js';
import { calculateOptimumInput } from './MEV.js';

const SOURCE = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
const MAX_PAIRS = 100
const USE_STORED_DATA = false

const dataCalls = DEXES.map(dex => getData(dex, USE_STORED_DATA))

console.log("Getting data...");
const dataSets = await Promise.all(dataCalls)

console.log("Creating cache...");
const cache = createCache(dataSets, DEXES, MAX_PAIRS)

console.log("Finding arbs...");
const actions = await getArbActions(cache, SOURCE)

for (const action of actions) {
  console.log(`From ${addressSymbolMap[action.from]}(${action.from}) to ${addressSymbolMap[action.to]}(${action.to}) on ${action.dex}`);
}

console.log("Calculating optimum...");
const [inputAmount, outputAmount] = calculateOptimumInput(actions, cache)

console.log(`Optimum input: ${inputAmount}, theoretical output: ${outputAmount}, profit: ${outputAmount - inputAmount} WAVAX`);

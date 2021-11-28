import { getLPMetadata } from './request.js';
import { Cache } from './cache.js';
import { getArbActions } from './arb.js';
import { calculateOptimumInput } from './MEV.js';
import { DataProvider } from './data.js';
import { readCache, writeCache } from './persistence.js';

const SOURCE = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
const MAX_PAIRS = 100
const USE_STORED_DATA = true
const USE_STORED_CACHE = false

const main = async () => {
  const metadata = await getLPMetadata(USE_STORED_DATA)

  const cache =  USE_STORED_CACHE ? readCache() : new Cache(metadata, MAX_PAIRS)

  const dataProvider = new DataProvider(cache.getLPs())

  console.log("Getting data...");
  await dataProvider.fetchData(cache)

  writeCache(cache)

  console.log("Finding arbs...");
  const actions = await getArbActions(cache, SOURCE)

  if (actions.length == 0) {
    console.log("No cycles found!");
    return
  }

  for (const action of actions) {
    console.log(`From ${cache.getSymbol([action.from])}(${action.from}) to ${cache.getSymbol([action.to])}(${action.to}) on ${action.dex}`);
  }

  console.log("Calculating optimum...");
  const [inputAmount, outputAmount] = calculateOptimumInput(actions, cache)

  console.log(`Optimum input: ${inputAmount}, theoretical output: ${outputAmount}, profit: ${outputAmount - inputAmount} WAVAX`);
}

main()

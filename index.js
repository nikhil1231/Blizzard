import { getLPMetadata } from './request.js';
import { Cache } from './cache.js';
import { getArbActions } from './arb.js';
import { calculateOptimumInput } from './MEV.js';
import { DataProvider, getAvaxPrice, getGasPrice, sendArb } from './ether.js';
import { readCache, writeCache, readBlacklist } from './persistence.js';
import { estimateGas } from './utils.js';
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { MIN_PROFIT, GAS_MULTIPLIER, MAX_PAIRS, MAIN_LOOP_INTERVAL } from "./config.js"


const SOURCE = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
const USE_STORED_DATA = true
const USE_STORED_CACHE = false

const scheduler = new ToadScheduler()

const blacklist = readBlacklist()

const metadata = await getLPMetadata(USE_STORED_DATA)
const cache =  USE_STORED_CACHE ? readCache() : new Cache(metadata, MAX_PAIRS, blacklist)
const dataProvider = new DataProvider(cache.getLPs())


const findArbs = async (cache) => {
  console.log("Finding arbs...");
  const actions = await getArbActions(cache, SOURCE)

  for (const action of actions) {
    console.log(`${action.dex}: From ${cache.getSymbol([action.from])}(${action.from}) to ${cache.getSymbol([action.to])}(${action.to})`);
  }
  return actions
}

const doTheMonsterMath = async (actions, cache, gasPriceCall) => {
  console.log("Calculating optimum...");
  let [inputAmount, outputAmount, grossProfit] = calculateOptimumInput(actions, cache)

  console.log(`Optimum input: ${inputAmount}, gross output: ${outputAmount}, gross profit: ${grossProfit} WAVAX`);

  const gasPrice = await gasPriceCall
  const estimatedGas = estimateGas(actions.length - 1, gasPrice) * GAS_MULTIPLIER
  console.log(`Gas price: ${gasPrice}, Estimated gas ${estimatedGas}`);

  const netProfit = grossProfit - estimatedGas
  console.log(`Net profit: ${netProfit} AVAX`);

  return [inputAmount, netProfit]
}

const formatActions = (actions) => {
  const tokens = actions.map(action => action.from)
  tokens.push(actions[actions.length - 1].to)
  const lps = actions.map(action => cache.get(action.dex, action.from, action.to).id)
  return [tokens, lps]
}

const execute = async (inputAmount, actions) => {
    console.log("Executing arb...");
    const [tokens, lps] = formatActions(actions)

    console.log(lps);

    return

    await sendArb(inputAmount, inputAmount, tokens, lps)
}

const main = async () => {
  console.log("\n============== LOOP START ==============")

  console.log("Getting data...");
  if (!USE_STORED_CACHE) {
    await dataProvider.fetchData(cache)
  }
  const gasPriceCall = getGasPrice()

  // writeCache(cache)

  const actions = await findArbs(cache)

  if (actions.length == 0) {
    console.log("No cycles found!");
    return
  }

  const [inputAmount, netProfit] = await doTheMonsterMath(actions, cache, gasPriceCall)

  if (netProfit > MIN_PROFIT) {
    await execute(inputAmount, actions)
  }
}

const mainTask = new AsyncTask('Main looper', () => main())
const mainJob = new SimpleIntervalJob(MAIN_LOOP_INTERVAL, mainTask)
scheduler.addSimpleIntervalJob(mainJob)

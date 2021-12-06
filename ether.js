import { ethers } from "ethers";
import { LP_ABI, ICE_ABI } from './utils.js';
import * as dotenv from "dotenv";

dotenv.config();

const rpc = parseInt(process.env.TEST)
  ? 'https://api.avax-test.network/ext/bc/C/rpc'
  : 'https://api.avax.network/ext/bc/C/rpc';

const provider = new ethers.providers.JsonRpcProvider(rpc)
const wallet = new ethers.Wallet(process.env.PK, provider);

const ice = new ethers.Contract(process.env.ICE, ICE_ABI, provider)
const AVAX_USD = new ethers.Contract('0xA389f9430876455C36478DeEa9769B7Ca4E3DDB1', LP_ABI, provider)


export class DataProvider {
  constructor(lps) {
    this.lpContracts = lps.map(lp => new ethers.Contract(lp, LP_ABI, provider))
  }

  async fetchData(cache) {
    const reqs = this.lpContracts.map(contract => contract.getReserves())
    const responses = await Promise.all(reqs)
    cache.updateReserves(responses)
  }
}

export const getAvaxPrice = async () => {
  const [_usd, _avax] = await AVAX_USD.getReserves()
  const avax = ethers.utils.formatEther(_avax)
  const usd = ethers.utils.formatUnits(_usd, 'mwei')
  return usd / avax;
}

export const getGasPrice = async () => {
  const gas = await provider.getGasPrice()
  const gasGwei = ethers.utils.formatEther(gas)
  return gasGwei
}

export const sendArb = async (amountIn, amountOutMin, tokens, lps) => {
  await ice.connect(wallet).arb(
    ethers.utils.parseEther(amountIn.toString()),
    ethers.utils.parseEther(amountOutMin.toString()),
    tokens,
    lps,
    // {
    //   gasLimit: 1e6
    // }
  )
}

export const withdraw = async (amount) => {
  return await ice.connect(wallet).withdraw(amount)
}

export const deposit = async (amount) => {
  return await ice.connect(wallet).deposit({
    value: amount
  })
}

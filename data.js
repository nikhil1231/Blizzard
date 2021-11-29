import { ethers } from "ethers";
import { LP_ABI } from './utils.js';

const provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc')
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

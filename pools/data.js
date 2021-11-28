import { ethers } from "ethers";
import { LP_ABI } from './utils.js';

const provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc')

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

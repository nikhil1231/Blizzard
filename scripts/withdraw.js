import { withdraw } from '../ether.js'
import { ethers } from "ethers";

(async () => {
  console.log(`Withdrawing ${process.argv[2]}...`)
  const tx = await withdraw(ethers.utils.parseEther(process.argv[2]))
  console.log(`Withdrawal sent, tx ${tx.hash}`)
})()

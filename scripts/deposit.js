import { deposit } from '../ether.js'
import { ethers } from "ethers";

(async () => {
  console.log(`Depositing ${process.argv[2]}...`)
  const tx = await deposit(ethers.utils.parseEther(process.argv[2]))
  console.log(`Deposit sent, tx ${tx.hash}`)
})()

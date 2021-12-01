import { Wallet } from "ethers"
import { addToEnv, keyExists } from "./_env.js"

(async () => {
  const key = "MNEMONIC"
  if (keyExists(key)) return console.log("ERROR: wallet already exists")

  const wallet = Wallet.createRandom()
  console.log(`Created new wallet: ${wallet.address}`)

  addToEnv("PK", wallet._signingKey().privateKey)
  addToEnv(key, wallet._mnemonic().phrase)
  addToEnv("SLAVE_ADDRESS", wallet.address)
})()

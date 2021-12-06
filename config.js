import { ethers } from 'ethers'

export const MIN_PROFIT = ethers.utils.parseEther("0.01")
export const MAX_A0 = ethers.utils.parseEther("10")
export const GAS_MULTIPLIER = 1.2
export const MAX_PAIRS = 100
export const MAIN_LOOP_INTERVAL = { seconds: 3 }

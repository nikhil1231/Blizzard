import assert from 'assert'
import { ethers } from "ethers"
import { getAmountOut } from "../utils.js"


describe('Util', () => {
  describe("#getAmountOut()", () => {
    it('should work in general', () => {
      const r1 = ethers.BigNumber.from('0x2e40ba6802dfad396637')
      const r2 = ethers.BigNumber.from('0x49d5c2bdffac6ce2bfdb6')

      const a = ethers.utils.parseEther('1.0')

      assert.deepEqual(getAmountOut(a, r1, r2), ethers.BigNumber.from("0x1616476cff1d0aced"))
    })
  })
})
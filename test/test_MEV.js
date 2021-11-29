import 'chai/register-should.js';
import { gradientDescent, getAmountsOutProfit } from '../MEV.js'

describe('MEV', () => {
  describe("#gradientDescent()", () => {
    it('should work in general', () => {
      const lps = [
        [ 1760.104810949577143161, 510958.904413422723689163 ],
        [ 35111.787554, 92357.377157968717157907 ],
        [ 87705749.540966, 807788.218102796778757298 ]
      ]

      const a0 = gradientDescent(lps)[0]

      const ans = getAmountsOutProfit(a0, lps)
      const an = ans[ans.length - 1]

      const e = 1
      const axs = getAmountsOutProfit(a0 - e, lps)
      const ax = axs[axs.length - 1]
      const ays = getAmountsOutProfit(a0 + e, lps)
      const ay = ays[ays.length - 1]

      an.should.be.greaterThan(ax).and.greaterThan(ay)
    })
  })
});

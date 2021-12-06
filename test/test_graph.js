import assert from 'assert'
import { constructGraph, findCycles, filterCycles } from '../graph.js'
import { makePairName } from '../utils.js';
import { Cache } from '../cache.js';
import { ethers } from 'ethers';
import { MIN_A0 } from '../config.js'

describe('Graph', () => {
  describe("#constructGraph()", () => {
    it('should work in general', () => {
      return
      const dexes = ['PNG', 'PNG']
      const symbols = ['a', 'b', 'c']
      const reserve = 1e7
      const pairs = {}

      for (const s1 of symbols) {
        for (const s2 of symbols.filter(s => s != s1)) {
          const pairName = makePairName(s1, s2)
          pairs[pairName] = {
            token0: {
              symbol: s1
            },
            token1: {
              symbol: s2
            },
            reserve0: reserve,
            reserve1: reserve * 2,
          }
        }
      }

      const _cache = {}
      for (const dex of dexes) {
        _cache[dex] = pairs
      }

      const cache = new Cache()
      cache._cache = _cache

      console.log(cache);

      const [v, e] = constructGraph(cache, symbols)

      assert.deepEqual(v, ['JOE_a',
      'JOE_b',
      'JOE_c',
      'PNG_a',
      'PNG_b',
      'PNG_c'])

      console.log(e);

      // TODO: test edges

    })
  })

  describe('#findCycles()', () => {
    it('should find no cycles in efficient market', () => {
      const g = newGraph()

      const cycles = findCycles(g, 'w')

      const filteredCycles = filterCycles(cycles)

      assert.deepEqual(filteredCycles, [])
    });

    it('should find a cycle in the same dex', () => {
      const g = newSmallGraph()

      g['JOE_w']['JOE_a'].r1 = ethers.utils.parseEther('2100')

      const cycles = findCycles(g, 'w')

      const filteredCycles = filterCycles(cycles)

      assert.equal(filteredCycles.length, 1)

      assert.deepEqual(filteredCycles[0].cycle, ['JOE_w', 'JOE_a', 'JOE_b', 'JOE_w'])
    });

    it('should ignore cycles with too low liquidity', () => {
      const g = newSmallGraph()

      g['JOE_w']['JOE_a'].r1 = ethers.utils.parseEther('2100') // Would normally cause arb

      g['JOE_a']['JOE_b'].r0 = ethers.utils.parseEther('40')
      g['JOE_a']['JOE_b'].r1 = ethers.utils.parseEther('80')

      const cycles = findCycles(g, 'w')

      const filteredCycles = filterCycles(cycles)

      assert.deepEqual(filteredCycles, [])
    });

    it('should find a cycle across dexes', () => {
      const g = newGraph()

      g['JOE_w']['JOE_a'].r1 = ethers.utils.parseEther('2010')

      g['PNG_a']['PNG_b'].r1 = ethers.utils.parseEther('2020')

      g['JOE_b']['JOE_w'].r1 = ethers.utils.parseEther('500')

      const cycles = findCycles(g, 'w')

      const filteredCycles = filterCycles(cycles)

      assert.equal(filteredCycles.length, 1)

      assert.deepEqual(filteredCycles[0].cycle, ['JOE_w', 'JOE_a', 'PNG_a', 'PNG_b', 'PNG_w'])

    });
  });
});

const newSmallGraph = () => ({
  'JOE_w': {
    'JOE_a': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('2000'),
      sameCoin: false
    },
    'JOE_b': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('4000'),
      sameCoin: false
    },
  },
  'JOE_a': {
    'JOE_w': {
      r0: ethers.utils.parseEther('2000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'JOE_b': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('2000'),
      sameCoin: false
    },
  },
  'JOE_b': {
    'JOE_w': {
      r0: ethers.utils.parseEther('4000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'JOE_a': {
      r0: ethers.utils.parseEther('2000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
  },
})

const newGraph = () => ({
  'JOE_w': {
    'JOE_a': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('2000'),
      sameCoin: false
    },
    'JOE_b': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('4000'),
      sameCoin: false
    },
    'JOE_c': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('2000'),
      sameCoin: false
    },
    'JOE_d': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('2000'),
      sameCoin: false
    },
    'JOE_e': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('2000'),
      sameCoin: false
    },
    'PNG_w': {
      r0: ethers.BigNumber.from('0'),
      r1: ethers.BigNumber.from('0'),
      sameCoin: true
    },
  },
  'JOE_a': {
    'JOE_w': {
      r0: ethers.utils.parseEther('2000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'JOE_b': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('2000'),
      sameCoin: false
    },
    'PNG_a': {
      r0: ethers.BigNumber.from('0'),
      r1: ethers.BigNumber.from('0'),
      sameCoin: true
    },
  },
  'JOE_b': {
    'JOE_w': {
      r0: ethers.utils.parseEther('4000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'JOE_a': {
      r0: ethers.utils.parseEther('2000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'PNG_b': {
      r0: ethers.BigNumber.from('0'),
      r1: ethers.BigNumber.from('0'),
      sameCoin: true
    },
  },
  'JOE_c': {
    'JOE_w': {
      r0: ethers.utils.parseEther('2000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'JOE_d': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'PNG_c': {
      r0: ethers.BigNumber.from('0'),
      r1: ethers.BigNumber.from('0'),
      sameCoin: true
    },
  },
  'JOE_d': {
    'JOE_w': {
      r0: ethers.utils.parseEther('2000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'JOE_c': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'JOE_e': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'PNG_d': {
      r0: ethers.BigNumber.from('0'),
      r1: ethers.BigNumber.from('0'),
      sameCoin: true
    },
  },
  'JOE_e': {
    'JOE_w': {
      r0: ethers.utils.parseEther('2000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'JOE_d': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'PNG_e': {
      r0: ethers.BigNumber.from('0'),
      r1: ethers.BigNumber.from('0'),
      sameCoin: true
    },
  },

  'PNG_w': {
    'PNG_a': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('2000'),
      sameCoin: false
    },
    'PNG_b': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('4000'),
      sameCoin: false
    },
    'PNG_c': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('2000'),
      sameCoin: false
    },
    'PNG_d': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('2000'),
      sameCoin: false
    },
    'PNG_e': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('2000'),
      sameCoin: false
    },
    'JOE_w': {
      r0: ethers.BigNumber.from('0'),
      r1: ethers.BigNumber.from('0'),
      sameCoin: true
    },
  },
  'PNG_a': {
    'PNG_w': {
      r0: ethers.utils.parseEther('2000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'PNG_b': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('2000'),
      sameCoin: false
    },
    'JOE_a': {
      r0: ethers.BigNumber.from('0'),
      r1: ethers.BigNumber.from('0'),
      sameCoin: true
    },
  },
  'PNG_b': {
    'PNG_w': {
      r0: ethers.utils.parseEther('4000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'PNG_a': {
      r0: ethers.utils.parseEther('2000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'JOE_b': {
      r0: ethers.BigNumber.from('0'),
      r1: ethers.BigNumber.from('0'),
      sameCoin: true
    },
  },
  'PNG_c': {
    'PNG_w': {
      r0: ethers.utils.parseEther('2000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'PNG_d': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'JOE_c': {
      r0: ethers.BigNumber.from('0'),
      r1: ethers.BigNumber.from('0'),
      sameCoin: true
    },
  },
  'PNG_d': {
    'PNG_w': {
      r0: ethers.utils.parseEther('2000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'PNG_c': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'PNG_e': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'JOE_d': {
      r0: ethers.BigNumber.from('0'),
      r1: ethers.BigNumber.from('0'),
      sameCoin: true
    },
  },
  'PNG_e': {
    'PNG_w': {
      r0: ethers.utils.parseEther('2000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'PNG_d': {
      r0: ethers.utils.parseEther('1000'),
      r1: ethers.utils.parseEther('1000'),
      sameCoin: false
    },
    'JOE_e': {
      r0: ethers.BigNumber.from('0'),
      r1: ethers.BigNumber.from('0'),
      sameCoin: true
    },
  },
})
import assert from 'assert'
import { Edge, constructGraphParams, bellmanFord, findCycles } from '../graph.js'

describe('Graph', () => {
  describe("#constructGraphParams()", () => {
    it('should work in general', () => {
      const dexes = ['JOE', 'PNG']
      const symbols = ['a', 'b']
      const price = 5
      const pairs = {}

      for (const s1 of symbols) {
        pairs[s1] = {}
        for (const s2 of symbols.filter(s => s != s1)) {
          pairs[s1][s2] = price
        }
      }

      const priceSets = dexes.map(dex => {
        return {
          dex,
          pairs
        }
      })

      const [v, e] = constructGraphParams(priceSets)

      assert.deepEqual(v, ['JOE_a',
      'JOE_b',
      'PNG_a',
      'PNG_b'])

      // TODO: test edges

    })
  })

  describe('#bellmanFord()', () => {
    it('should work for standard input', () => {
      const v = ['s', 'a', 'b', 'c', 'd', 'e']
      const edges = [
        new Edge('s', 'a', 10),
        new Edge('s', 'e', 8),
        new Edge('a', 'c', 2),
        new Edge('b', 'a', 1),
        new Edge('c', 'b', -2),
        new Edge('d', 'a', -4),
        new Edge('d', 'c', -1),
        new Edge('e', 'd', 1),
      ]
      const [dists, parents] = bellmanFord(v, edges, ['s'])
      assert.deepEqual(dists, {
        's': 0,
        'a': 5,
        'b': 5,
        'c': 7,
        'd': 9,
        'e': 8,
      });

      assert.deepEqual(parents, {
        's': null,
        'a': 'd',
        'b': 'c',
        'c': 'a',
        'd': 'e',
        'e': 's',
      })
    });

    it('should work with cycles', () => {
      const v = ['s', 'a', 'b']
      const edges = [
        new Edge('s', 'a', 1),
        new Edge('a', 'b', 1),
        new Edge('b', 's', -3),
      ]
      const [dists, parents] = bellmanFord(v, edges, ['s'])
      assert.deepEqual(dists, {
        's': -2,
        'a': 0,
        'b': 1,
      });

      assert.deepEqual(parents, {
        's': 'b',
        'a': 's',
        'b': 'a',
      })
    });

    it('should work for negative log values', () => {
      const v = ['s', 'a', 'b']
      const edges = [
        newEdge('s', 'a', 1),
        newEdge('a', 'b', 4),
        newEdge('b', 's', 0.5),
      ]
      const [dists, parents] = bellmanFord(v, edges, ['s'])
      assert.deepEqual(dists, {
        's': nlPathCost(1, 4, 0.5, 1, 4, 0.5),
        'a': nlPathCost(1, 4, 0.5, 1),
        'b': nlPathCost(1, 4, 0.5, 1, 4),
      });

      assert.deepEqual(parents, {
        's': 'b',
        'a': 's',
        'b': 'a',
      })
    });

    it('should work for multiple exchanges', () => {
      const v = ['1s', '1a', '1b', '2s', '2a', '2b']
      const edges = [
        newEdge('1s', '1a', 1),
        newEdge('1a', '1b', 2),
        newEdge('1b', '1s', 0.6),

        newEdge('2s', '2a', 1.1),
        newEdge('2a', '2b', 2.1),
        newEdge('2b', '2s', 0.5),

        newEdge('1s', '2s', 1),
        newEdge('2s', '1s', 1),
        newEdge('1a', '2a', 1),
        newEdge('2a', '1a', 1),
        newEdge('1b', '2b', 1),
        newEdge('2b', '1b', 1),
      ]
      const [dists, parents] = bellmanFord(v, edges, ['1s', '2s'])

      assert.deepEqual(parents, {
        '1s': '1b',
        '1a': '2a',
        '1b': '2b',
        '2s': '1s',
        '2a': '2s',
        '2b': '2a',
      })
    });
  });

  describe('#findCycles()', () => {
    it('should work for standard input', () => {
      const v = ['s', 'a', 'b', 'c']
      const edges = [
        new Edge('s', 'a', 1),
        new Edge('a', 'b', 1),
        new Edge('b', 's', -3),
        new Edge('s', 'c', 0),
        new Edge('c', 'b', 1),
      ]
      const dists = {
        's': -5,
        'a': -2,
        'b': -4,
        'c': -5,
      }
      const parents = {
        's': 'b',
        'a': 's',
        'b': 'c',
        'c': 's',
      }

      const cycles = findCycles(v, edges, dists, parents)

      assert.deepEqual(cycles, [
        [
          's',
          'c',
          'b',
          's'
        ]
      ])
    });
  });
});

const newEdge = (from, to, w) => new Edge(from, to, nl(w))
const nl = (x) => -Math.log(x)
const nlPathCost = (...xs) => xs.map(x => nl(x)).reduce((acc, cur) => acc + cur, 0)
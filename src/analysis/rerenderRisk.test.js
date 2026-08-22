import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getRerenderRisks, riskLevelFor } from '../utils/rerenderRisk.js'

function node(id, importedBy, signals) {
  return { id, type: 'component', isGhost: false, imports: [], importedBy, signals }
}

test('getRerenderRisks ranks contexts by consumer count', () => {
  const nodes = [
    node('theme.js', [], { stateHooks: 0, contextConsumers: [], memoized: false, definesContext: true }),
    ...['a', 'b', 'c'].map((f) =>
      node(`${f}.js`, [], { stateHooks: 1, contextConsumers: ['ThemeContext'], memoized: false, definesContext: false })
    ),
    ...['x', 'y'].map((f) =>
      node(`${f}.js`, [], { stateHooks: 0, contextConsumers: ['AuthContext'], memoized: false, definesContext: false })
    ),
  ]
  const result = getRerenderRisks(nodes)
  assert.equal(result.contexts[0].name, 'ThemeContext')
  assert.equal(result.contexts[0].consumers, 3)
  assert.equal(result.contexts[1].name, 'AuthContext')
})

test('getRerenderRisks flags widely-used unmemoized components', () => {
  const fanIn = Array.from({ length: 6 }, (_, i) => `f${i}.js`)
  const nodes = [
    node('big.js', fanIn, { stateHooks: 2, contextConsumers: [], memoized: false, definesContext: false }),
    node('memoized.js', fanIn, { stateHooks: 0, contextConsumers: [], memoized: true, definesContext: false }),
    node('small.js', ['only.js'], { stateHooks: 0, contextConsumers: [], memoized: false, definesContext: false }),
  ]
  const result = getRerenderRisks(nodes)
  assert.deepEqual(result.wideUnmemoized.map((entry) => entry.id), ['big.js'])
})

test('riskLevelFor maps consumers to escalating levels', () => {
  const s = (n) => ({ contextConsumers: Array.from({ length: n }, (_, i) => `C${i}`) })
  assert.equal(riskLevelFor(s(1)), 0)
  assert.equal(riskLevelFor(s(2)), 1)
  assert.equal(riskLevelFor(s(3)), 2)
  assert.equal(riskLevelFor(s(5)), 3)
  assert.equal(riskLevelFor(null), 0)
})

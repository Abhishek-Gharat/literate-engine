import assert from 'node:assert/strict'
import { test } from 'node:test'
import { computeHealthScore, scoreToGrade, getHealthColor } from '../utils/healthScore.js'

function makeNode(id, imports = [], importedBy = [], extra = {}) {
  return { id, type: 'component', isGhost: false, imports, importedBy, ...extra }
}

test('computeHealthScore returns null score for an empty graph', () => {
  const result = computeHealthScore({ nodes: [], cyclicEdges: [] })
  assert.equal(result.score, null)
  assert.equal(result.grade, null)
  assert.deepEqual(result.breakdown, [])
})

test('computeHealthScore rewards a clean linear graph', () => {
  const nodes = [
    makeNode('a.jsx', ['./b.jsx'], []),
    makeNode('b.jsx', ['./c.jsx'], ['a.jsx']),
    makeNode('c.jsx', [], ['b.jsx']),
  ]
  const result = computeHealthScore({ nodes, cyclicEdges: [], unresolvedImports: 0 })
  assert.equal(result.score, 100)
  assert.equal(result.grade, 'A')
  assert.equal(result.metrics.cycles, 0)
  assert.ok(result.breakdown.every((item) => item.status === 'good'))
})

test('computeHealthScore penalizes circular dependencies', () => {
  const clean = computeHealthScore({
    nodes: [
      makeNode('a.js', ['./b.js'], []),
      makeNode('b.js', [], ['a.js']),
    ],
    cyclicEdges: [],
  })
  const cycled = computeHealthScore({
    nodes: [
      makeNode('a.js', ['./b.js'], ['b.js']),
      makeNode('b.js', ['./a.js'], ['a.js']),
    ],
    cyclicEdges: [
      { source: 'a.js', target: 'b.js' },
      { source: 'b.js', target: 'a.js' },
    ],
  })
  assert.ok(cycled.score < clean.score)
  const cyclesItem = cycled.breakdown.find((item) => item.id === 'cycles')
  assert.notEqual(cyclesItem.status, 'good')
})

test('computeHealthScore penalizes orphan files proportionally', () => {
  const nodes = [
    makeNode('main.js', ['./used.js'], []),
    makeNode('used.js', [], ['main.js']),
    makeNode('orphan1.js'),
    makeNode('orphan2.js'),
  ]
  const result = computeHealthScore({ nodes, cyclicEdges: [] })
  assert.ok(result.score < 100)
  assert.equal(result.metrics.orphans, 2)
  const orphanItem = result.breakdown.find((item) => item.id === 'orphans')
  assert.equal(orphanItem.status, 'bad')
})

test('computeHealthScore flags god components at the fan-in threshold', () => {
  const hub = makeNode('hub.js', [], Array.from({ length: 8 }, (_, i) => `f${i}.js`))
  const importers = Array.from({ length: 8 }, (_, i) =>
    makeNode(`f${i}.js`, ['./hub.js'], [])
  )
  const result = computeHealthScore({ nodes: [hub, ...importers], cyclicEdges: [] })
  assert.equal(result.metrics.godComponents, 1)
  const godItem = result.breakdown.find((item) => item.id === 'godComponents')
  assert.equal(godItem.status, 'warn')
})

test('computeHealthScore never drops below zero on a pathological graph', () => {
  const size = 10
  const nodes = Array.from({ length: size }, (_, i) =>
    makeNode(
      `${i}.js`,
      Array.from({ length: size - 1 }, (_, j) => `./${(i + j + 1) % size}.js`),
      Array.from({ length: size - 1 }, (_, j) => `${(i + j + 1) % size}.js`)
    )
  )
  const result = computeHealthScore({
    nodes,
    cyclicEdges: Array.from({ length: 30 }, (_, i) => ({
      source: `${i % size}.js`,
      target: `${(i + 1) % size}.js`,
    })),
    unresolvedImports: 50,
  })
  assert.equal(typeof result.score, 'number')
  assert.ok(result.score >= 0)
  assert.ok(result.score <= 40)
  assert.equal(result.grade, 'F')
})

test('ghost nodes do not count as project files or orphans', () => {
  const nodes = [
    makeNode('app.js', ['react'], []),
    makeNode('react', [], ['app.js'], { isGhost: true }),
  ]
  const result = computeHealthScore({ nodes, cyclicEdges: [] })
  assert.equal(result.metrics.totalFiles, 1)
  assert.equal(result.metrics.orphans, 0)
})

test('scoreToGrade and getHealthColor follow the band contract', () => {
  assert.equal(scoreToGrade(100), 'A')
  assert.equal(scoreToGrade(85), 'A')
  assert.equal(scoreToGrade(70), 'B')
  assert.equal(scoreToGrade(55), 'C')
  assert.equal(scoreToGrade(40), 'D')
  assert.equal(scoreToGrade(0), 'F')
  assert.equal(scoreToGrade(null), null)
  assert.equal(getHealthColor(90), '#0cce6b')
  assert.equal(getHealthColor(null), '#a1a1a1')
})

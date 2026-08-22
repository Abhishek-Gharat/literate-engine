import assert from 'node:assert/strict'
import { test } from 'node:test'
import { computeBlastRadius } from '../utils/impactAnalysis.js'

function rfNode(id, imports = [], importedBy = []) {
  return { id, type: 'componentNode', data: { label: id, imports, importedBy } }
}

test('computeBlastRadius returns null for unknown or missing source', () => {
  const nodes = [rfNode('a.js', [], [])]
  assert.equal(computeBlastRadius(null, nodes), null)
  assert.equal(computeBlastRadius('missing.js', nodes), null)
})

test('computeBlastRadius finds direct dependents at depth 1', () => {
  const nodes = [
    rfNode('lib.js', [], ['a.js', 'b.js']),
    rfNode('a.js', ['./lib.js']),
    rfNode('b.js', ['./lib.js']),
  ]
  const result = computeBlastRadius('lib.js', nodes)
  assert.equal(result.total, 2)
  assert.equal(result.directCount, 2)
  assert.equal(result.indirectCount, 0)
  assert.equal(result.maxDepth, 1)
  assert.deepEqual(result.ordered.map((e) => e.id).sort(), ['a.js', 'b.js'])
})

test('computeBlastRadius walks transitive chains and reports max depth', () => {
  const nodes = [
    rfNode('core.js', [], ['mid.js']),
    rfNode('mid.js', ['./core.js'], ['leaf.js']),
    rfNode('leaf.js', ['./mid.js'], ['top.js']),
    rfNode('top.js', ['./leaf.js']),
  ]
  const result = computeBlastRadius('core.js', nodes)
  assert.equal(result.total, 3)
  assert.equal(result.maxDepth, 3)
  assert.equal(result.ordered[0].id, 'mid.js')
  assert.equal(result.ordered[0].depth, 1)
  assert.equal(result.ordered[2].depth, 3)
})

test('computeBlastRadius deduplicates diamond dependencies with minimum depth', () => {
  const nodes = [
    rfNode('base.js', [], ['left.js', 'right.js']),
    rfNode('left.js', ['./base.js'], ['top.js']),
    rfNode('right.js', ['./base.js'], ['top.js']),
    rfNode('top.js', ['./left.js', './right.js']),
  ]
  const result = computeBlastRadius('base.js', nodes)
  const topEntries = result.ordered.filter((e) => e.id === 'top.js')
  assert.equal(topEntries.length, 1)
  assert.equal(topEntries[0].depth, 2)
  assert.equal(result.total, 3)
})

test('computeBlastRadius is safe against cycles in the dependency graph', () => {
  const nodes = [
    rfNode('a.js', ['./b.js'], ['b.js', 'c.js']),
    rfNode('b.js', ['./a.js'], ['a.js']),
    rfNode('c.js', ['./a.js']),
  ]
  const result = computeBlastRadius('a.js', nodes)
  assert.equal(result.total, 2)
  assert.ok(result.ordered.every((e) => e.id !== 'a.js'))
})

test('computeBlastRadius ranks deeper-equal nodes by fan-in weight', () => {
  const nodes = [
    rfNode('hub.js', [], ['small.js', 'big.js']),
    rfNode('small.js', ['./hub.js']),
    rfNode('big.js', ['./hub.js'], ['x.js', 'y.js']),
    rfNode('x.js', ['./big.js']),
    rfNode('y.js', ['./big.js']),
  ]
  const result = computeBlastRadius('hub.js', nodes)
  const directIds = result.ordered.filter((e) => e.depth === 1).map((e) => e.id)
  assert.equal(directIds[0], 'big.js')
})

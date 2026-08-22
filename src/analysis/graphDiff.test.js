import assert from 'node:assert/strict'
import { test } from 'node:test'
import { computeGraphDiff } from '../utils/graphDiff.js'

function makeRun(nodes, edges) {
  return { snapshot: { nodes, edges } }
}

const n = (id) => ({ id, type: 'component', imports: [], importedBy: [] })
const e = (source, target) => ({ id: `${source}__${target}`, source, target })

test('computeGraphDiff returns null when snapshots are missing', () => {
  assert.equal(computeGraphDiff(null, null), null)
  assert.equal(computeGraphDiff(makeRun([], []), makeRun([n('a')], [])), null)
})

test('computeGraphDiff classifies added and removed nodes', () => {
  const prev = makeRun([n('a.js'), n('b.js')], [])
  const curr = makeRun([n('b.js'), n('c.js')], [])

  const diff = computeGraphDiff(prev, curr)
  assert.deepEqual(diff.addedNodes.map((x) => x.id), ['c.js'])
  assert.deepEqual(diff.removedNodes.map((x) => x.id), ['a.js'])
  assert.deepEqual(diff.commonNodes.map((x) => x.id), ['b.js'])
  assert.equal(diff.summary.addedFiles, 1)
  assert.equal(diff.summary.removedFiles, 1)
  assert.equal(diff.summary.unchangedFiles, 1)
})

test('computeGraphDiff classifies dependency changes by edge identity', () => {
  const prev = makeRun([n('a.js'), n('b.js'), n('old.js')], [e('a.js', 'b.js'), e('a.js', 'old.js')])
  const curr = makeRun([n('a.js'), n('b.js'), n('new.js')], [e('a.js', 'b.js'), e('b.js', 'new.js')])

  const diff = computeGraphDiff(prev, curr)
  assert.deepEqual(diff.addedEdges.map((x) => x.id), ['b.js__new.js'])
  assert.deepEqual(diff.removedEdges.map((x) => x.id), ['a.js__old.js'])
  assert.deepEqual(diff.commonEdges.map((x) => x.id), ['a.js__b.js'])
  assert.equal(diff.summary.addedDeps, 1)
  assert.equal(diff.summary.removedDeps, 1)
})

test('computeGraphDiff handles identical runs', () => {
  const run = makeRun([n('a.js')], [e('a.js', 'a.js')])
  const diff = computeGraphDiff(run, run)
  assert.equal(diff.addedNodes.length, 0)
  assert.equal(diff.removedNodes.length, 0)
  assert.equal(diff.addedEdges.length, 0)
  assert.equal(diff.removedEdges.length, 0)
})

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildEvolutionSteps } from '../utils/evolution.js'

function run(id, createdAt, nodeIds) {
  return {
    id,
    createdAt,
    snapshot: { nodes: nodeIds.map((id2) => ({ id: id2, type: 'component' })), edges: [] },
  }
}

test('buildEvolutionSteps returns empty for no runs', () => {
  assert.deepEqual(buildEvolutionSteps([]), [])
  assert.deepEqual(buildEvolutionSteps(null), [])
})

test('buildEvolutionSteps orders runs chronologically and marks the first as base', () => {
  const steps = buildEvolutionSteps([
    run('r2', '2024-02-01T00:00:00Z', ['a.js', 'b.js']),
    run('r1', '2024-01-01T00:00:00Z', ['a.js']),
  ])
  assert.equal(steps.length, 2)
  assert.equal(steps[0].run.id, 'r1')
  assert.ok(steps[0].nodes.every((entry) => entry.status === 'base'))
  assert.deepEqual(steps[0].removed, [])
})

test('buildEvolutionSteps classifies added vs unchanged and tracks removals', () => {
  const steps = buildEvolutionSteps([
    run('r1', '2024-01-01T00:00:00Z', ['a.js', 'b.js']),
    run('r2', '2024-02-01T00:00:00Z', ['a.js', 'c.js']),
  ])

  const statuses = Object.fromEntries(steps[1].nodes.map((entry) => [entry.node.id, entry.status]))
  assert.equal(statuses['a.js'], 'unchanged')
  assert.equal(statuses['c.js'], 'added')

  assert.deepEqual(steps[1].removed.map((node) => node.id), ['b.js'])
  assert.equal(steps[1].summary.removedCount, 1)
})

test('buildEvolutionSteps skips runs without snapshots', () => {
  const steps = buildEvolutionSteps([
    { id: 'broken', createdAt: '2024-01-01T00:00:00Z' },
    run('ok', '2024-03-01T00:00:00Z', ['x.js']),
  ])
  assert.equal(steps.length, 1)
  assert.equal(steps[0].run.id, 'ok')
})

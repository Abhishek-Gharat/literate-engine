import assert from 'node:assert/strict'
import { test } from 'node:test'
import { prioritizeIssues, SEVERITY } from './issuePrioritizer.js'

test('prioritizeIssues handles empty graphs gracefully', () => {
  const result = prioritizeIssues({ nodes: [], cyclicEdges: [] })
  assert.deepEqual(result.issues, [])
  assert.equal(result.counts.total, 0)
  assert.deepEqual(result.recommendations, [])
})

test('prioritizeIssues detects and prioritizes circular dependencies', () => {
  const nodes = [
    { id: 'src/A.js', label: 'A.js', imports: ['src/B.js'], importedBy: ['src/B.js'] },
    { id: 'src/B.js', label: 'B.js', imports: ['src/A.js'], importedBy: ['src/A.js'] },
  ]
  const cyclicEdges = [{ source: 'src/A.js', target: 'src/B.js' }]

  const result = prioritizeIssues({ nodes, cyclicEdges })
  assert.equal(result.issues.length, 1)
  assert.equal(result.issues[0].type, 'cycle')
  assert.equal(result.issues[0].severity, SEVERITY.HIGH)
  assert.equal(result.recommendations.length, 1)
})

test('prioritizeIssues ranks high coupling / god components by blast radius', () => {
  const importers = Array.from({ length: 15 }, (_, i) => `src/comp${i}.js`)
  const hubNode = {
    id: 'src/AuthContext.js',
    label: 'AuthContext.js',
    imports: [],
    importedBy: importers,
  }
  const nodes = [
    hubNode,
    ...importers.map(id => ({ id, label: id, imports: ['src/AuthContext.js'], importedBy: [] }))
  ]

  const result = prioritizeIssues({ nodes })
  const couplingIssue = result.issues.find(i => i.type === 'coupling')
  assert.ok(couplingIssue)
  assert.equal(couplingIssue.severity, SEVERITY.CRITICAL)
  assert.ok(couplingIssue.affectedCount >= 15)
})

test('prioritizeIssues detects orphan files as low severity', () => {
  const nodes = [
    { id: 'src/abandoned.js', label: 'abandoned.js', nodeType: 'component', imports: [], importedBy: [] }
  ]

  const result = prioritizeIssues({ nodes })
  assert.equal(result.issues.length, 1)
  assert.equal(result.issues[0].type, 'orphan')
  assert.equal(result.issues[0].severity, SEVERITY.LOW)
})

test('prioritizeIssues tolerates null stats from an unanalysed project', () => {
  const result = prioritizeIssues({ nodes: [], cyclicEdges: [], stats: null })
  assert.deepEqual(result.issues, [])
  assert.equal(result.counts.total, 0)
})

test('prioritizeIssues extracts top 3 actionable recommendations', () => {
  const nodes = [
    { id: 'src/Hub.js', label: 'Hub.js', imports: [], importedBy: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] },
    { id: 'src/C1.js', label: 'C1.js', imports: ['src/C2.js'], importedBy: ['src/C2.js'] },
    { id: 'src/C2.js', label: 'C2.js', imports: ['src/C1.js'], importedBy: ['src/C1.js'] },
    { id: 'src/Orphan.js', label: 'Orphan.js', nodeType: 'component', imports: [], importedBy: [] },
  ]
  const cyclicEdges = [{ source: 'src/C1.js', target: 'src/C2.js' }]

  const result = prioritizeIssues({ nodes, cyclicEdges })
  assert.ok(result.recommendations.length <= 3)
  assert.equal(result.recommendations[0].rank, 1)
  assert.equal(result.recommendations[1].rank, 2)
})

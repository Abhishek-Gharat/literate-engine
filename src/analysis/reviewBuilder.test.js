import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildReviewDigest } from '../utils/reviewBuilder.js'

function makeNode(id, imports = [], importedBy = [], isGhost = false) {
  return { id, type: 'component', isGhost, imports, importedBy }
}

test('buildReviewDigest includes stats, health score, and structure counts', () => {
  const digest = buildReviewDigest({
    nodes: [makeNode('a.js', ['./b.js'], [])],
    cyclicEdges: [],
    unresolvedImports: 2,
    stats: { totalFiles: 1, totalComponents: 4, healthScore: 82, healthGrade: 'B' },
  })
  assert.match(digest, /Files: 1 \| Components: 4/)
  assert.match(digest, /Health Score: 82\/100 \(B\)/)
  assert.match(digest, /UNRESOLVED IMPORTS: 2/)
})

test('buildReviewDigest lists cycles with unique pairs and a cap', () => {
  const cyclicEdges = []
  for (let i = 0; i < 15; i++) {
    cyclicEdges.push({ source: `${i}.js`, target: `${(i + 1) % 15}.js` })
    cyclicEdges.push({ source: `${(i + 1) % 15}.js`, target: `${i}.js` })
  }
  const digest = buildReviewDigest({ nodes: [], cyclicEdges, stats: null })
  const cycleSection = digest.split('ORPHANS')[0]
  const pairLines = cycleSection.split('\n').filter((line) => line.includes(' <-> '))
  assert.equal(pairLines.length, 10)
  assert.match(cycleSection, /\.\.\.and 5 more/)
})

test('buildReviewDigest reports none when the graph is clean', () => {
  const digest = buildReviewDigest({
    nodes: [makeNode('a.js', [], ['b.js']), makeNode('b.js', ['./a.js'], [])],
    cyclicEdges: [],
    stats: null,
  })
  assert.match(digest, /CYCLES \(0\):\nnone/)
  assert.match(digest, /ORPHANS \(0\):\nnone/)
})

test('buildReviewDigest ranks most connected files by combined fan weight', () => {
  const nodes = [
    makeNode('hub.js', [], ['x.js', 'y.js', 'z.js']),
    makeNode('leaf.js', []),
    makeNode('x.js', ['./hub.js']),
    makeNode('y.js', ['./hub.js']),
    makeNode('z.js', ['./hub.js']),
  ]
  const digest = buildReviewDigest({ nodes, cyclicEdges: [], stats: null })
  const coupled = digest.split('MOST CONNECTED FILES:')[1].split('GOD COMPONENTS')[0]
  assert.match(coupled, /hub\.js \(used by 3, imports 0\)/)
  assert.ok(coupled.indexOf('hub.js') < coupled.indexOf('leaf.js'))
})

test('buildReviewDigest flags god components above thresholds', () => {
  const hub = makeNode('god.js', [], Array.from({ length: 8 }, (_, i) => `f${i}.js`))
  const importers = Array.from({ length: 8 }, (_, i) => makeNode(`f${i}.js`, ['./god.js']))
  const digest = buildReviewDigest({ nodes: [hub, ...importers], cyclicEdges: [], stats: null })
  assert.match(digest, /GOD COMPONENTS[^\n]*: 1/)
})

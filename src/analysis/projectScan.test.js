import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { collectSourceFiles, buildReport, formatMarkdown } from '../utils/projectScan.js'

function makeFixtureProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reactviz-scan-'))
  fs.mkdirSync(path.join(root, 'src'), { recursive: true })
  fs.mkdirSync(path.join(root, 'node_modules', 'pkg'), { recursive: true })

  fs.writeFileSync(
    path.join(root, 'src', 'app.js'),
    "import { used } from './lib.js'\nused()"
  )
  fs.writeFileSync(
    path.join(root, 'src', 'lib.js'),
    'export function used() {}\nexport function unusedFn() {}'
  )
  // should be ignored entirely
  fs.writeFileSync(
    path.join(root, 'node_modules', 'pkg', 'index.js'),
    'export function noise(){}'
  )
  return root
}

test('collectSourceFiles walks the tree and skips ignored directories', () => {
  const root = makeFixtureProject()
  try {
    const files = collectSourceFiles(root)
    const names = files.map((file) => file.name).sort()
    assert.deepEqual(names, ['src/app.js', 'src/lib.js'])
    assert.ok(files.every((file) => typeof file.content === 'string'))
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('buildReport produces score, grade and dead export summary', () => {
  const root = makeFixtureProject()
  try {
    const report = buildReport(root)
    assert.equal(typeof report.score, 'number')
    assert.ok(report.score <= 100 && report.score >= 0)
    assert.equal(report.stats.totalFiles, 2)
    assert.equal(report.deadExports.length, 1)
    assert.deepEqual(report.deadExports[0], { file: 'src/lib.js', exports: ['unusedFn'] })
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('formatMarkdown renders a PR-ready comment with the score table', () => {
  const report = {
    generatedAt: '2024-01-01T00:00:00.000Z',
    score: 82,
    grade: 'B',
    stats: {
      totalFiles: 10, totalComponents: 4, totalHooks: 2,
      cyclesFound: 1, unresolvedImports: 0, analysisErrors: 0,
      totalStateHooks: 3, contextDefinitions: 1,
    },
    deadExports: [{ file: 'src/old.js', exports: ['a', 'b'] }],
    analysisErrorsSample: [],
  }
  const markdown = formatMarkdown(report)
  assert.match(markdown, /Health Score:\*\* 82\/100 \(B\)/)
  assert.match(markdown, /\| Circular dependencies \| 1 \|/)
  assert.match(markdown, /Dead exports by file/)
  assert.match(markdown, /`src\/old\.js`: a, b/)
})

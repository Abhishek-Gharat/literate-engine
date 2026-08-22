import assert from 'node:assert/strict'
import { test } from 'node:test'
import { analyzeProject } from './engine.js'

test('flags named exports that nothing imports', () => {
  const result = analyzeProject([
    {
      name: 'src/main.js',
      content: "import { usedFn } from './utils.js'\nusedFn()",
    },
    {
      name: 'src/utils.js',
      content:
        'export function usedFn() {}\nexport function unusedFn() {}\nexport const UNUSED_CONST = 1',
    },
  ])

  const utils = result.nodes.find((node) => node.id === 'src/utils.js')
  assert.deepEqual(utils.deadExports, ['UNUSED_CONST', 'unusedFn'])
  assert.equal(result.stats.deadExports, 2)
})

test('default-only usage does not mark named exports as used', () => {
  const result = analyzeProject([
    {
      name: 'src/app.js',
      content: "import Helper from './helper.js'\nHelper()",
    },
    {
      name: 'src/helper.js',
      content: 'export default function run() {}\nexport function orphan() {}',
    },
  ])

  const helper = result.nodes.find((node) => node.id === 'src/helper.js')
  assert.deepEqual(helper.deadExports, ['orphan'])
})

test('namespace and dynamic imports treat the whole target as used', () => {
  for (const importer of [
    "import * as U from './utils.js'",
    "const U = require('./utils.js')",
    "import('./utils.js')",
  ]) {
    const result = analyzeProject([
      { name: 'src/app.js', content: importer },
      { name: 'src/utils.js', content: 'export function a() {}\nexport function b() {}' },
    ])
    const utils = result.nodes.find((node) => node.id === 'src/utils.js')
    assert.deepEqual(utils.deadExports, [], `opaque import should clear dead exports: ${importer}`)
  }
})

test('usage propagates through re-export barrels', () => {
  const result = analyzeProject([
    {
      name: 'src/consumer.js',
      content: "import { helper } from './barrel.js'\nhelper()",
    },
    {
      name: 'src/barrel.js',
      content: "export { helper } from './impl.js'\nexport { ghost } from './impl.js'",
    },
    {
      name: 'src/impl.js',
      content: 'export function helper() {}\nexport function ghost() {}\nexport function hidden() {}',
    },
  ])

  const impl = result.nodes.find((node) => node.id === 'src/impl.js')
  // impl.helper is consumed transitively via the barrel; impl.ghost is NOT,
  // because the barrel's own `ghost` re-export is never imported by anyone.
  assert.deepEqual(impl.deadExports.sort(), ['ghost', 'hidden'])

  const barrel = result.nodes.find((node) => node.id === 'src/barrel.js')
  assert.deepEqual(barrel.deadExports.sort(), ['ghost'])
})

test('clean project reports zero dead exports and full health score', () => {
  const result = analyzeProject([
    {
      name: 'src/app.js',
      content: "import { a } from './lib.js'\na()",
    },
    {
      name: 'src/lib.js',
      content: 'export function a() {}\nconst private_ = 1',
    },
  ])

  assert.equal(result.stats.deadExports, 0)
  assert.equal(result.stats.healthScore, 100)
})

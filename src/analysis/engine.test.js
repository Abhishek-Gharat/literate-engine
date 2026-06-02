import assert from 'node:assert/strict'
import { test } from 'node:test'
import { analyzeProject } from './engine.js'

test('analyzeProject handles mixed import styles, barrels, aliases, and dynamic imports', () => {
  const result = analyzeProject([
    {
      name: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@/*': ['src/*'],
          },
        },
      }),
    },
    {
      name: 'src/App.jsx',
      content: `
        import React from 'react'
        import Header from './components/Header'
        const legacy = require('./legacy')
        const Lazy = import('./pages/LazyPage')
        import('./pages/' + routeName)
        export { Button } from './components'
        import config from '@/config'
        import missingAlias from '@/missing/Thing'
        import './styles.css'
      `,
    },
    {
      name: 'src/components/index.js',
      content: "export { default as Button } from './Button'",
    },
    {
      name: 'src/components/Button.jsx',
      content: 'export default function Button() { return null }',
    },
    {
      name: 'src/components/Header.jsx',
      content: 'export default function Header() { return null }',
    },
    {
      name: 'src/legacy.js',
      content: 'module.exports = {}',
    },
    {
      name: 'src/pages/LazyPage.jsx',
      content: 'export default function LazyPage() { return null }',
    },
    {
      name: 'src/config.ts',
      content: 'export const config = {}',
    },
  ])

  const appEdges = result.edges.filter((edge) => edge.source === 'src/App.jsx')
  const edgeTypes = new Map(appEdges.map((edge) => [edge.target, edge.type]))
  const errorCodes = result.analysisErrors.map((error) => error.code)

  assert.equal(result.depMap['src/App.jsx'].includes('src/components/Header.jsx'), true)
  assert.equal(result.depMap['src/App.jsx'].includes('src/components/index.js'), true)
  assert.equal(edgeTypes.get('src/components/Header.jsx'), 'static-import')
  assert.equal(edgeTypes.get('src/pages/LazyPage.jsx'), 'dynamic-import')
  assert.equal(edgeTypes.get('src/legacy.js'), 'require')
  assert.equal(edgeTypes.get('src/config.ts'), 'static-import')
  assert.equal(edgeTypes.get('@/missing/Thing'), 'unresolved')
  assert.ok(result.unresolvedImports.some((entry) => entry.importPath === '@/missing/Thing'))
  assert.ok(errorCodes.includes('DYNAMIC_IMPORT_EXPRESSION'))
  assert.ok(errorCodes.includes('UNSUPPORTED_ASSET_IMPORT'))
})

test('analyzeProject reports malformed source files without crashing the whole analysis', () => {
  const result = analyzeProject([
    {
      name: 'src/App.tsx',
      content: "import Header from './Header'\nexport default function App(",
    },
    {
      name: 'src/Header.tsx',
      content: 'export default function Header() { return null }',
    },
  ])

  assert.equal(result.stats.totalFiles, 2)
  assert.equal(result.depMap['src/Header.tsx'].length, 0)
  assert.ok(result.analysisErrors.some((error) => error.code === 'PARSE_ERROR' && error.file === 'src/App.tsx'))
})

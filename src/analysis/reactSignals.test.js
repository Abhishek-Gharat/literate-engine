import assert from 'node:assert/strict'
import { test } from 'node:test'
import { analyzeProject, extractReactSignals } from './engine.js'

test('extractReactSignals detects state hooks, contexts and memoization', () => {
  const signals = extractReactSignals(`
    import React, { useState, useContext } from 'react'
    import { ThemeContext } from './theme'
    const Ctx = createContext(null)
    export function Panel() {
      const [open, setOpen] = useState(false)
      const [count, setCount] = useState(0)
      const theme = useContext(ThemeContext)
      const value = useMemo(() => theme, [theme])
      return null
    }
  `)
  assert.equal(signals.stateHooks, 2)
  assert.deepEqual(signals.contextConsumers, ['ThemeContext'])
  assert.equal(signals.memoized, true)
  assert.equal(signals.definesContext, true)
})

test('analyzeProject attaches signals to nodes and aggregates stats', () => {
  const result = analyzeProject([
    {
      name: 'src/store.js',
      content: 'export const ThemeCtx = createContext(null)',
    },
    {
      name: 'src/App.jsx',
      content: `
        import { useState } from 'react'
        import { ThemeCtx } from './store.js'
        export default function App() {
          const [n, setN] = useState(0)
          const [m] = useState(1)
          const t = useContext(ThemeCtx)
          return null
        }
      `,
    },
  ])

  const app = result.nodes.find((node) => node.id === 'src/App.jsx')
  assert.equal(app.signals.stateHooks, 2)
  assert.deepEqual(app.signals.contextConsumers, ['ThemeCtx'])
  assert.equal(app.signals.memoized, false)

  const store = result.nodes.find((node) => node.id === 'src/store.js')
  assert.equal(store.signals.definesContext, true)

  assert.equal(result.stats.totalStateHooks, 2)
  assert.equal(result.stats.contextDefinitions, 1)
})

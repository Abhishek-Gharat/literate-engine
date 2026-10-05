import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  buildRefactorDigest,
  parseRefactorResponse,
  generateUnifiedPatchFromFiles,
  generateOfflineRefactorPlan,
} from '../utils/refactorBuilder.js'

test('buildRefactorDigest handles circular dependency issues', () => {
  const digest = buildRefactorDigest(
    { type: 'cycle', source: 'CartModal.jsx', target: 'CartContext.jsx' },
    {
      depMap: {
        'CartModal.jsx': ['CartContext.jsx'],
        'CartContext.jsx': ['CartModal.jsx'],
      },
    }
  )

  assert.match(digest, /Architectural Issue: Circular Dependency/)
  assert.match(digest, /CartModal\.jsx/)
  assert.match(digest, /CartContext\.jsx/)
})

test('buildRefactorDigest handles god component issues', () => {
  const digest = buildRefactorDigest({
    type: 'god_component',
    node: {
      id: 'App.jsx',
      data: {
        imports: ['Header.jsx', 'Sidebar.jsx', 'Footer.jsx'],
        importedBy: ['main.jsx'],
      },
    },
  })

  assert.match(digest, /Architectural Issue: Over-Coupled Component/)
  assert.match(digest, /App\.jsx/)
})

test('generateOfflineRefactorPlan creates decoupling files and unified patch for cycles', () => {
  const plan = generateOfflineRefactorPlan({
    type: 'cycle',
    source: 'CartModal.jsx',
    target: 'CartContext.jsx',
  })

  assert.ok(plan.diagnosis.length > 0)
  assert.ok(plan.strategy.length > 0)
  assert.ok(Array.isArray(plan.files) && plan.files.length >= 2)
  assert.match(plan.patch, /--- \/dev\/null/)
  assert.match(plan.patch, /\+\+\+ b\/src\/types\/CartContextTypes\.js/)
  assert.equal(plan.isOffline, true)
})

test('parseRefactorResponse parses markdown into structured plan', () => {
  const markdown = `## Diagnosis
Direct mutual dependency between component and context.

## Decoupling Strategy
1. Extract shared types to types.js
2. Rewire CartModal

## Refactored Code
### \`src/types/cart.js\` [status: created]
\`\`\`jsx
export const DEFAULT_CART = []
\`\`\`

## Unified Git Patch
\`\`\`diff
--- /dev/null
+++ b/src/types/cart.js
@@ -0,0 +1,1 @@
+export const DEFAULT_CART = []
\`\`\`
`

  const parsed = parseRefactorResponse(markdown)
  assert.equal(parsed.diagnosis, 'Direct mutual dependency between component and context.')
  assert.match(parsed.strategy, /Extract shared types/)
  assert.equal(parsed.files.length, 1)
  assert.equal(parsed.files[0].path, 'src/types/cart.js')
  assert.equal(parsed.files[0].status, 'created')
  assert.match(parsed.patch, /DEFAULT_CART/)
})

test('generateUnifiedPatchFromFiles produces valid git unified diff format', () => {
  const files = [
    {
      path: 'src/shared.js',
      status: 'created',
      code: 'export const X = 1',
    },
  ]
  const patch = generateUnifiedPatchFromFiles(files)
  assert.match(patch, /--- \/dev\/null/)
  assert.match(patch, /\+\+\+ b\/src\/shared\.js/)
  assert.match(patch, /\+export const X = 1/)
})

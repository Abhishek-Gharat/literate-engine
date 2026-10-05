import assert from 'node:assert/strict'
import { test, describe, it } from 'node:test'
import {
  classifyNodeType,
  getNodeRiskLevel,
  evaluateNodeFilter,
  searchArchitectureNodes,
} from './architectureFilters.js'

test('architectureFilters - classifyNodeType classifies node types correctly', () => {
  assert.equal(classifyNodeType({ id: 'src/pages/Home.jsx', nodeType: 'page' }), 'pages')
  assert.equal(classifyNodeType({ id: 'src/hooks/useUser.js', nodeType: 'hook' }), 'hooks')
  assert.equal(classifyNodeType({ id: 'src/context/AuthContext.jsx', nodeType: 'context' }), 'contexts')
  assert.equal(classifyNodeType({ id: 'src/services/apiClient.js' }), 'services')
  assert.equal(classifyNodeType({ id: 'src/utils/formatDate.js' }), 'utils')
  assert.equal(classifyNodeType({ id: 'src/components/Button.jsx', nodeType: 'component' }), 'components')
})

test('architectureFilters - getNodeRiskLevel determines risk level based on fan-in and context consumers', () => {
  assert.equal(getNodeRiskLevel({ importedBy: new Array(10) }), 'high')
  assert.equal(getNodeRiskLevel({ importedBy: new Array(5) }), 'medium')
  assert.equal(getNodeRiskLevel({ importedBy: ['a'] }), 'low')
})

test('architectureFilters - evaluateNodeFilter evaluates filters properly without modifying node', () => {
  const node = { id: 'src/hooks/useCart.js', nodeType: 'hook', importedBy: ['a', 'b', 'c', 'd', 'e'] }
  assert.equal(evaluateNodeFilter(node, { typeFilter: 'hooks' }), true)
  assert.equal(evaluateNodeFilter(node, { typeFilter: 'pages' }), false)
  assert.equal(evaluateNodeFilter(node, { riskFilter: 'medium' }), true)
  assert.equal(evaluateNodeFilter(node, { riskFilter: 'low' }), false)
})

test('architectureFilters - searchArchitectureNodes groups search results by category with counts', () => {
  const nodes = [
    { id: 'src/pages/Login.jsx', label: 'Login', nodeType: 'page' },
    { id: 'src/components/LoginForm.jsx', label: 'LoginForm', nodeType: 'component' },
    { id: 'src/hooks/useAuth.js', label: 'useAuth', nodeType: 'hook' },
    { id: 'src/context/AuthContext.jsx', label: 'AuthContext', nodeType: 'context' },
  ]

  const result = searchArchitectureNodes(nodes, 'auth')
  assert.equal(result.total, 2)
  assert.equal(result.grouped.hooks.length, 1)
  assert.equal(result.grouped.contexts.length, 1)
})

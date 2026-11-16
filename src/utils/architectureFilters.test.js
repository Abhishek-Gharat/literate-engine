import assert from 'node:assert/strict'
import { test } from 'node:test'
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

test('architectureFilters - searchArchitectureNodes matches on filePath and handles empty queries', () => {
  const nodes = [
    { id: 'node1', label: 'CustomButton', filePath: 'src/components/ui/button.jsx', nodeType: 'component' },
    { id: 'node2', label: 'Header', filePath: 'src/components/Header.jsx', nodeType: 'component' }
  ]
  const emptyRes = searchArchitectureNodes(nodes, '')
  assert.equal(emptyRes.total, 0)
  assert.equal(emptyRes.flat.length, 0)

  const pathRes = searchArchitectureNodes(nodes, 'ui/button')
  assert.equal(pathRes.total, 1)
  assert.equal(pathRes.flat[0].label, 'CustomButton')
})

test('architectureFilters - evaluateNodeFilter handles issues filters', () => {
  const cyclicNode = { id: 'src/A.js', isCyclic: true }
  const cleanNode = { id: 'src/B.js', isCyclic: false, importedBy: ['c'] }
  const highImpactNode = { id: 'src/C.js', importedBy: new Array(12) }

  const filterOptions = {
    issueFilter: 'cycles',
    cyclicNodeIds: new Set(['src/A.js']),
    highImpactNodeIds: new Set(['src/C.js']),
  }

  assert.equal(evaluateNodeFilter(cyclicNode, filterOptions), true)
  assert.equal(evaluateNodeFilter(cleanNode, filterOptions), false)
  assert.equal(evaluateNodeFilter(highImpactNode, { ...filterOptions, issueFilter: 'high_impact' }), true)
})

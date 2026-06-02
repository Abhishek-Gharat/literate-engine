import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateAnalysisResponse } from './analysisApi.js'

test('validateAnalysisResponse accepts the current API contract', () => {
  const payload = {
    nodes: [],
    edges: [],
    depMap: {},
    cyclicEdges: [],
    stats: {},
    unresolvedImports: [],
    analysisErrors: [],
  }

  assert.equal(validateAnalysisResponse(payload), payload)
})

test('validateAnalysisResponse rejects invalid analysis response shapes', () => {
  assert.throws(
    () => validateAnalysisResponse({ nodes: [], edges: [] }),
    /invalid response shape/
  )
})

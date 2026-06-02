import assert from 'node:assert/strict'
import { test } from 'node:test'
import { adaptAnalysisToGraph } from './graphAdapter.js'

test('adaptAnalysisToGraph maps API analysis into React Flow nodes and edges', () => {
  const graph = adaptAnalysisToGraph({
    nodes: [
      {
        id: 'src/App.jsx',
        type: 'root',
        isGhost: false,
        imports: ['src/Header.jsx'],
        importedBy: [],
      },
      {
        id: 'src/Header.jsx',
        type: 'component',
        isGhost: false,
        imports: [],
        importedBy: ['src/App.jsx'],
      },
    ],
    edges: [
      {
        id: 'src/App.jsx__src/Header.jsx',
        source: 'src/App.jsx',
        target: 'src/Header.jsx',
        importType: 'dynamic-import',
        cyclic: false,
      },
    ],
    depMap: {
      'src/App.jsx': ['src/Header.jsx'],
      'src/Header.jsx': [],
    },
    cyclicEdges: [],
    stats: {},
    unresolvedImports: [],
    analysisErrors: [],
  })

  assert.equal(graph.nodes.length, 2)
  assert.equal(graph.edges.length, 1)
  assert.equal(graph.nodes[0].type, 'componentNode')
  assert.equal(graph.nodes[0].data.label, 'src/App.jsx')
  assert.equal(graph.edges[0].type, 'animatedEdge')
  assert.equal(graph.edges[0].data.importType, 'dynamic-import')
})

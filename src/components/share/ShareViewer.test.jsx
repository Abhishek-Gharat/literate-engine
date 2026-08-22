import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ShareViewer from './ShareViewer'

vi.mock('../GraphCanvas', () => ({
  default: ({ initialNodes }) => (
    <div data-testid="stub-canvas">
      {initialNodes.map((node) => (
        <span key={node.id}>{node.id}</span>
      ))}
    </div>
  ),
}))

vi.mock('../../services/runsApi', () => ({
  getRun: vi.fn(),
}))

import { getRun } from '../../services/runsApi'

const makeRun = () => ({
  id: 'run-1',
  stats: { totalFiles: 2, totalComponents: 5, healthScore: 88, healthGrade: 'A' },
  snapshot: {
    nodes: [
      { id: 'src/App.jsx', type: 'component', isGhost: false, imports: ['./lib.js'], importedBy: [] },
      { id: 'src/lib.js', type: 'component', isGhost: false, imports: [], importedBy: ['src/App.jsx'] },
    ],
    edges: [{ id: 'src/App.jsx__src/lib.js', source: 'src/App.jsx', target: 'src/lib.js' }],
    cyclicEdges: [],
  },
})

describe('ShareViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows loading state before the run resolves', () => {
    getRun.mockImplementation(() => new Promise(() => {}))
    render(<ShareViewer runId="run-1" />)
    expect(screen.getByText(/Loading shared run/i)).toBeInTheDocument()
  })

  test('renders shared graph with stats for a valid run', async () => {
    getRun.mockResolvedValue(makeRun())
    render(<ShareViewer runId="run-1" />)

    await waitFor(() => {
      expect(screen.getByTestId('stub-canvas')).toBeInTheDocument()
    })
    expect(screen.getByText('src/App.jsx')).toBeInTheDocument()
    expect(screen.getByText('src/lib.js')).toBeInTheDocument()
    expect(getRun).toHaveBeenCalledWith('run-1')
    expect(screen.getByRole('link', { name: /Open ReactViz/i })).toHaveAttribute('href', '/')
  })

  test('shows a friendly error when the run does not exist', async () => {
    getRun.mockRejectedValue(new Error('not found'))
    render(<ShareViewer runId="missing" />)

    await waitFor(() => {
      expect(screen.getByText(/could not be found/i)).toBeInTheDocument()
    })
    expect(screen.queryByTestId('stub-canvas')).not.toBeInTheDocument()
  })

  test('explains when a run has no graph data', async () => {
    const run = makeRun()
    run.snapshot.nodes = []
    getRun.mockResolvedValue(run)
    render(<ShareViewer runId="run-1" />)

    await waitFor(() => {
      expect(screen.getByText(/no graph data/i)).toBeInTheDocument()
    })
  })
})

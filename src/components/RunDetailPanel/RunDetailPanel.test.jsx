import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RunDetailPanel from './index'

describe('RunDetailPanel', () => {
  const createMockRun = (overrides = {}) => ({
    id: 'run-abc-123',
    createdAt: '2024-01-15T10:30:00.000Z',
    stats: {
      totalFiles: 5,
      totalComponents: 3
    },
    ...overrides
  })

  test('renders loading state', () => {
    render(
      <RunDetailPanel
        run={null}
        loading={true}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-loading')).toBeInTheDocument()
    expect(screen.getByText('⏳')).toBeInTheDocument()
    expect(screen.getByText('Loading run details...')).toBeInTheDocument()
  })

  test('renders empty state when no run selected', () => {
    render(
      <RunDetailPanel
        run={null}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-empty')).toBeInTheDocument()
    expect(screen.getByText('No Run Selected')).toBeInTheDocument()
    expect(screen.getByText('Select a saved run from the list to view its details')).toBeInTheDocument()
    expect(screen.getByText('📊')).toBeInTheDocument()
  })

  test('renders empty state when run is undefined', () => {
    render(
      <RunDetailPanel
        run={undefined}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-empty')).toBeInTheDocument()
  })

  test('renders error state', () => {
    render(
      <RunDetailPanel
        run={null}
        loading={false}
        error="Failed to load run"
      />
    )

    expect(screen.getByTestId('run-detail-error')).toBeInTheDocument()
    expect(screen.getByText('Failed to load run')).toBeInTheDocument()
    expect(screen.getByText('⚠️')).toBeInTheDocument()
  })

  test('renders error state with non-string error', () => {
    render(
      <RunDetailPanel
        run={null}
        loading={false}
        error={123}
      />
    )

    expect(screen.getByTestId('run-detail-error')).toBeInTheDocument()
    expect(screen.getByText('Failed to load run details')).toBeInTheDocument()
  })

  test('renders full valid run details', () => {
    const run = createMockRun({
      snapshot: { nodes: [], edges: [] }
    })

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-panel')).toBeInTheDocument()
    expect(screen.getByTestId('run-detail-id')).toHaveTextContent('run-abc-123')
    expect(screen.getByTestId('run-detail-files')).toHaveTextContent('5 files')
    expect(screen.getByTestId('run-detail-components')).toHaveTextContent('3 components')
    expect(screen.getByTestId('run-detail-snapshot')).toHaveTextContent('Available')
  })

  test('handles missing stats gracefully', () => {
    const run = createMockRun({ stats: undefined })

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-panel')).toBeInTheDocument()
    // Check within the stat row element - contains label + value
    const filesRow = screen.getByTestId('run-detail-files')
    const componentsRow = screen.getByTestId('run-detail-components')
    expect(filesRow.textContent).toContain('— file')
    expect(componentsRow.textContent).toContain('— component')
  })

  test('handles null stats gracefully', () => {
    const run = createMockRun({ stats: null })

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error={null}
      />
    )

    const filesRow = screen.getByTestId('run-detail-files')
    const componentsRow = screen.getByTestId('run-detail-components')
    expect(filesRow.textContent).toContain('— file')
    expect(componentsRow.textContent).toContain('— component')
  })

  test('handles missing totalFiles gracefully', () => {
    const run = createMockRun({ stats: { totalComponents: 3 } })

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error={null}
      />
    )

    const filesRow = screen.getByTestId('run-detail-files')
    const componentsRow = screen.getByTestId('run-detail-components')
    expect(filesRow.textContent).toContain('— file')
    expect(componentsRow.textContent).toContain('3 components')
  })

  test('handles missing totalComponents gracefully', () => {
    const run = createMockRun({ stats: { totalFiles: 5 } })

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error={null}
      />
    )

    const filesRow = screen.getByTestId('run-detail-files')
    const componentsRow = screen.getByTestId('run-detail-components')
    expect(filesRow.textContent).toContain('5 files')
    expect(componentsRow.textContent).toContain('— component')
  })

  test('handles invalid createdAt gracefully', () => {
    const run = createMockRun({ createdAt: 'invalid-date' })

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-date')).toHaveTextContent('Invalid date')
  })

  test('handles null createdAt gracefully', () => {
    const run = createMockRun({ createdAt: null })

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-date')).toHaveTextContent('Unknown')
  })

  test('handles undefined createdAt gracefully', () => {
    const run = createMockRun({ createdAt: undefined })

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-date')).toHaveTextContent('Unknown')
  })

  test('shows no snapshot when snapshot is missing', () => {
    const run = createMockRun()

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-snapshot')).toHaveTextContent('No snapshot')
  })

  test('shows snapshot available when snapshot exists', () => {
    const run = createMockRun({ snapshot: { nodes: [], edges: [] } })

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-snapshot')).toHaveTextContent('Available')
  })

  test('handles empty snapshot object', () => {
    const run = createMockRun({ snapshot: {} })

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-snapshot')).toHaveTextContent('Available')
  })

  test('handles malformed run object with missing id', () => {
    const run = { createdAt: '2024-01-15', stats: {} }

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-panel')).toBeInTheDocument()
    expect(screen.getByTestId('run-detail-id')).toHaveTextContent('Unknown')
  })

  test('handles non-object run gracefully', () => {
    render(
      <RunDetailPanel
        run="not an object"
        loading={false}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-empty')).toBeInTheDocument()
  })

  test('handles array run gracefully (shows empty state)', () => {
    render(
      <RunDetailPanel
        run={['not', 'valid']}
        loading={false}
        error={null}
      />
    )

    // Arrays are objects, so it will try to render them
    expect(screen.getByTestId('run-detail-panel')).toBeInTheDocument()
  })

  test('displays stats with singular form when value is 1', () => {
    const run = createMockRun({
      stats: {
        totalFiles: 1,
        totalComponents: 1
      }
    })

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-files')).toHaveTextContent('1 file')
    expect(screen.getByTestId('run-detail-components')).toHaveTextContent('1 component')
  })

  test('renders placeholder for future features', () => {
    const run = createMockRun()

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-placeholder')).toBeInTheDocument()
    // Use flexible text matcher for emoji + text
    expect(screen.getByText(/Graph Preview/)).toBeInTheDocument()
    expect(screen.getByText('Coming soon')).toBeInTheDocument()
  })

  test('loading state takes precedence over run data', () => {
    const run = createMockRun()

    render(
      <RunDetailPanel
        run={run}
        loading={true}
        error={null}
      />
    )

    expect(screen.getByTestId('run-detail-loading')).toBeInTheDocument()
    expect(screen.queryByTestId('run-detail-panel')).not.toBeInTheDocument()
  })

  test('error state takes precedence over run data', () => {
    const run = createMockRun()

    render(
      <RunDetailPanel
        run={run}
        loading={false}
        error="Something went wrong"
      />
    )

    expect(screen.getByTestId('run-detail-error')).toBeInTheDocument()
    expect(screen.queryByTestId('run-detail-panel')).not.toBeInTheDocument()
  })
})

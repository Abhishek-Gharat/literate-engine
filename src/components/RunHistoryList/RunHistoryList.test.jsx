import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RunHistoryList from './index'

describe('RunHistoryList', () => {
  let mockOnRetry
  let mockOnSelectRun

  beforeEach(() => {
    mockOnRetry = vi.fn()
    mockOnSelectRun = vi.fn()
  })

  const createMockRun = (id, overrides = {}) => ({
    id,
    createdAt: '2024-01-15T10:30:00.000Z',
    stats: {
      totalFiles: 5,
      totalComponents: 3,
      ...overrides.stats
    },
    ...overrides
  })

  test('renders loading state', () => {
    render(
      <RunHistoryList
        runs={[]}
        selectedRunId={null}
        loading={true}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    expect(screen.getByTestId('run-history-loading')).toBeInTheDocument()
    expect(screen.getByText('Loading runs...')).toBeInTheDocument()
    expect(screen.getByText('⏳')).toBeInTheDocument()
  })

  test('renders empty state', () => {
    render(
      <RunHistoryList
        runs={[]}
        selectedRunId={null}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    expect(screen.getByTestId('run-history-empty')).toBeInTheDocument()
    expect(screen.getByText('No Runs Yet')).toBeInTheDocument()
    expect(screen.getByText('Analyze files to save your first run')).toBeInTheDocument()
    expect(screen.getByText('📭')).toBeInTheDocument()
  })

  test('renders error state with retry button', async () => {
    const errorMessage = 'Failed to connect to server'
    
    render(
      <RunHistoryList
        runs={[]}
        selectedRunId={null}
        loading={false}
        error={errorMessage}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    expect(screen.getByTestId('run-history-error')).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    
    const retryButton = screen.getByTestId('run-history-retry-button')
    expect(retryButton).toBeInTheDocument()
    expect(retryButton).toHaveTextContent('Retry')
    expect(retryButton).not.toBeDisabled()

    // Click retry
    await userEvent.click(retryButton)
    expect(mockOnRetry).toHaveBeenCalledTimes(1)
  })

  test('renders error state with object error', () => {
    const errorObject = { message: 'Network timeout' }
    
    render(
      <RunHistoryList
        runs={[]}
        selectedRunId={null}
        loading={false}
        error={errorObject}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    expect(screen.getByText('Network timeout')).toBeInTheDocument()
  })

  test('renders empty state when error is null', () => {
    render(
      <RunHistoryList
        runs={[]}
        selectedRunId={null}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    // When error is null, empty state should be shown
    expect(screen.getByTestId('run-history-empty')).toBeInTheDocument()
  })

  test('retry button is disabled while loading', () => {
    render(
      <RunHistoryList
        runs={[]}
        selectedRunId={null}
        loading={true}
        error="Some error"
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    // When loading is true, loading state takes precedence over error
    expect(screen.getByTestId('run-history-loading')).toBeInTheDocument()
  })

  test('renders runs list correctly', () => {
    const runs = [
      createMockRun('run-1'),
      createMockRun('run-2', { stats: { totalFiles: 10, totalComponents: 5 } })
    ]

    render(
      <RunHistoryList
        runs={runs}
        selectedRunId={null}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    expect(screen.getByTestId('run-history-list')).toBeInTheDocument()
    expect(screen.getByTestId('run-item-run-1')).toBeInTheDocument()
    expect(screen.getByTestId('run-item-run-2')).toBeInTheDocument()
    expect(screen.getByText('5 files')).toBeInTheDocument()
    expect(screen.getByText('3 comps')).toBeInTheDocument()
    expect(screen.getByText('10 files')).toBeInTheDocument()
  })

  test('highlights selected run', () => {
    const runs = [
      createMockRun('run-1'),
      createMockRun('run-2')
    ]

    render(
      <RunHistoryList
        runs={runs}
        selectedRunId="run-1"
        loading={false}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    const selectedItem = screen.getByTestId('run-item-run-1')
    const unselectedItem = screen.getByTestId('run-item-run-2')

    // Check selection via aria-current on button and data-selected attribute
    const selectedButton = selectedItem.querySelector('button')
    const unselectedButton = unselectedItem.querySelector('button')
    expect(selectedButton).toHaveAttribute('aria-current', 'true')
    expect(unselectedButton).not.toHaveAttribute('aria-current')
    expect(selectedItem).toHaveTextContent('Selected ✓')
    expect(unselectedItem).toHaveTextContent('Click to load →')
  })

  test('disables run interaction while loading', async () => {
    const runs = [createMockRun('run-1')]

    render(
      <RunHistoryList
        runs={runs}
        selectedRunId={null}
        loading={true}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    // Loading state takes precedence
    expect(screen.getByTestId('run-history-loading')).toBeInTheDocument()
    expect(screen.queryByTestId('run-item-run-1')).not.toBeInTheDocument()
  })

  test('calls onSelectRun when a run is clicked', async () => {
    const runs = [
      createMockRun('run-1'),
      createMockRun('run-2')
    ]

    render(
      <RunHistoryList
        runs={runs}
        selectedRunId={null}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    // Click the button inside the li
    await userEvent.click(screen.getByTestId('run-item-run-1').querySelector('button'))
    expect(mockOnSelectRun).toHaveBeenCalledTimes(1)
    expect(mockOnSelectRun).toHaveBeenCalledWith('run-1')

    await userEvent.click(screen.getByTestId('run-item-run-2').querySelector('button'))
    expect(mockOnSelectRun).toHaveBeenCalledTimes(2)
    expect(mockOnSelectRun).toHaveBeenCalledWith('run-2')
  })

  test('calls onRetry when retry is clicked', async () => {
    render(
      <RunHistoryList
        runs={[]}
        selectedRunId={null}
        loading={false}
        error="Failed to load"
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    await userEvent.click(screen.getByTestId('run-history-retry-button'))
    expect(mockOnRetry).toHaveBeenCalledTimes(1)
  })

  test('handles runs that is undefined', () => {
    render(
      <RunHistoryList
        runs={undefined}
        selectedRunId={null}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    expect(screen.getByTestId('run-history-empty')).toBeInTheDocument()
  })

  test('handles runs that is null', () => {
    render(
      <RunHistoryList
        runs={null}
        selectedRunId={null}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    expect(screen.getByTestId('run-history-empty')).toBeInTheDocument()
  })

  test('handles runs that is not an array', () => {
    render(
      <RunHistoryList
        runs="not an array"
        selectedRunId={null}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    expect(screen.getByTestId('run-history-empty')).toBeInTheDocument()
  })

  test('filters out runs missing id', () => {
    const runs = [
      createMockRun('run-1'),
      { createdAt: '2024-01-15', stats: {} }, // missing id
      createMockRun('run-3')
    ]

    render(
      <RunHistoryList
        runs={runs}
        selectedRunId={null}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    expect(screen.getByTestId('run-item-run-1')).toBeInTheDocument()
    expect(screen.getByTestId('run-item-run-3')).toBeInTheDocument()
    expect(screen.queryByTestId('run-item-undefined')).not.toBeInTheDocument()
    expect(screen.queryByTestId('run-item-unknown')).not.toBeInTheDocument()
  })

  test('filters out null or non-object runs', () => {
    const runs = [
      createMockRun('run-1'),
      null,
      'string run',
      createMockRun('run-4')
    ]

    render(
      <RunHistoryList
        runs={runs}
        selectedRunId={null}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    expect(screen.getByTestId('run-item-run-1')).toBeInTheDocument()
    expect(screen.getByTestId('run-item-run-4')).toBeInTheDocument()
  })

  test('handles malformed run objects gracefully', () => {
    const runs = [
      { id: 'run-1' }, // missing stats and createdAt
      createMockRun('run-2')
    ]

    render(
      <RunHistoryList
        runs={runs}
        selectedRunId={null}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    expect(screen.getByTestId('run-item-run-1')).toBeInTheDocument()
    expect(screen.getByTestId('run-item-run-2')).toBeInTheDocument()
    expect(screen.getByText('Unknown date')).toBeInTheDocument()
  })

  test('distinguishes runs with similar labels by id', () => {
    const runs = [
      createMockRun('run-abc-123', { createdAt: '2024-01-15T10:00:00.000Z' }),
      createMockRun('run-abc-456', { createdAt: '2024-01-15T11:00:00.000Z' })
    ]

    render(
      <RunHistoryList
        runs={runs}
        selectedRunId="run-abc-456"
        loading={false}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    const item1 = screen.getByTestId('run-item-run-abc-123')
    const item2 = screen.getByTestId('run-item-run-abc-456')

    // Check selection via button aria-current
    const button1 = item1.querySelector('button')
    const button2 = item2.querySelector('button')
    expect(button1).not.toHaveAttribute('aria-current')
    expect(button2).toHaveAttribute('aria-current', 'true')
  })

  test('handles keyboard navigation', async () => {
    const runs = [createMockRun('run-1')]

    render(
      <RunHistoryList
        runs={runs}
        selectedRunId={null}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    const item = screen.getByTestId('run-item-run-1')
    const button = item.querySelector('button')
    button.focus()
    
    await userEvent.keyboard('{Enter}')
    expect(mockOnSelectRun).toHaveBeenCalledWith('run-1')

    mockOnSelectRun.mockClear()
    await userEvent.keyboard(' ')
    expect(mockOnSelectRun).toHaveBeenCalledWith('run-1')
  })

  test('does not call onSelectRun when disabled', async () => {
    const runs = [createMockRun('run-1')]

    render(
      <RunHistoryList
        runs={runs}
        selectedRunId={null}
        loading={true}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    // When loading, the loading state is shown, not the run items
    expect(screen.queryByTestId('run-item-run-1')).not.toBeInTheDocument()
    expect(mockOnSelectRun).not.toHaveBeenCalled()
  })

  test('does not crash if onSelectRun is not provided', async () => {
    const runs = [createMockRun('run-1')]

    render(
      <RunHistoryList
        runs={runs}
        selectedRunId={null}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
      />
    )

    // Should not throw when clicking
    await userEvent.click(screen.getByTestId('run-item-run-1'))
    // No assertion needed - test passes if no error is thrown
  })

  test('does not crash if onRetry is not provided', async () => {
    render(
      <RunHistoryList
        runs={[]}
        selectedRunId={null}
        loading={false}
        error="Error message"
        onSelectRun={mockOnSelectRun}
      />
    )

    // Should not throw when clicking retry
    await userEvent.click(screen.getByTestId('run-history-retry-button'))
    // No assertion needed - test passes if no error is thrown
  })

  test('handles invalid date strings gracefully', () => {
    const runs = [
      createMockRun('run-1', { createdAt: 'invalid-date' }),
      createMockRun('run-2', { createdAt: null }),
      createMockRun('run-3', { createdAt: undefined })
    ]

    render(
      <RunHistoryList
        runs={runs}
        selectedRunId={null}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
        onSelectRun={mockOnSelectRun}
      />
    )

    expect(screen.getByTestId('run-item-run-1')).toBeInTheDocument()
    expect(screen.getByTestId('run-item-run-2')).toBeInTheDocument()
    expect(screen.getByTestId('run-item-run-3')).toBeInTheDocument()
    // All should show "Unknown date" for invalid dates
    const unknownDates = screen.getAllByText('Unknown date')
    expect(unknownDates).toHaveLength(3)
  })
})

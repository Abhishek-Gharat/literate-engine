import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileInput from './index'

// Mock the API services
vi.mock('../../services/projectsApi', () => ({
  listProjects: vi.fn(),
  createProject: vi.fn(),
}))

vi.mock('../../services/runsApi', () => ({
  listRuns: vi.fn(),
  getRun: vi.fn(),
}))

import { listProjects, createProject } from '../../services/projectsApi'
import { listRuns, getRun } from '../../services/runsApi'

describe('FileInput Component', () => {
  const mockOnFilesReady = vi.fn()
  const mockOnSelectProject = vi.fn()
  const mockOnLoadRun = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Renders FileInput on the Runs tab where the runs history lives
  const renderFileInput = (props = {}) =>
    render(
      <FileInput
        onFilesReady={mockOnFilesReady}
        onSelectProject={mockOnSelectProject}
        onLoadRun={mockOnLoadRun}
        activeTab="Runs"
        onTabChange={vi.fn()}
        {...props}
      />
    )

  test('shows disabled state when no project is selected', async () => {
    listProjects.mockResolvedValue([])

    render(
      <FileInput
        onFilesReady={mockOnFilesReady}
        onSelectProject={mockOnSelectProject}
        onLoadRun={mockOnLoadRun}
        selectedProject={null}
      />
    )

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument()
    })

    // Should show "no project" warning
    expect(screen.getByTestId('no-project-warning')).toBeInTheDocument()

    // File dropzone should be visible but disabled (opacity 0.5)
    const dropzone = screen.getByTestId('file-dropzone')
    expect(dropzone).toBeInTheDocument()
  })

  test('disables actions while requests are in flight', async () => {
    const mockProject = { id: '1', name: 'Test Project', runCount: 0 }
    listProjects.mockResolvedValue([mockProject])
    listRuns.mockImplementation(() => new Promise(() => {})) // Never resolves

    renderFileInput({ selectedProject: mockProject })

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument()
    })

    // Runs are loading (request never resolves), so the loading state stays
    expect(screen.getByTestId('run-history-loading')).toBeInTheDocument()
  })

  test('renders empty runs state correctly', async () => {
    const mockProject = { id: '1', name: 'Test Project', runCount: 0 }
    listProjects.mockResolvedValue([mockProject])
    listRuns.mockResolvedValue([])

    renderFileInput({ selectedProject: mockProject })

    // Wait for runs to load
    await waitFor(() => {
      expect(screen.queryByTestId('run-history-loading')).not.toBeInTheDocument()
    })

    // Should show empty runs state
    expect(screen.getByTestId('run-history-empty')).toBeInTheDocument()
    expect(screen.getByText('No saved runs yet')).toBeInTheDocument()
  })

  test('renders backend error state with retry button', async () => {
    listProjects.mockRejectedValue(new Error('Failed to connect to server'))

    render(
      <FileInput
        onFilesReady={mockOnFilesReady}
        onSelectProject={mockOnSelectProject}
        onLoadRun={mockOnLoadRun}
        selectedProject={null}
      />
    )

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByTestId('projects-error')).toBeInTheDocument()
    })

    // Should show error message
    expect(screen.getByText(/Failed to connect to server/i)).toBeInTheDocument()

    // Should have retry button
    const retryButton = screen.getByTestId('retry-projects-button')
    expect(retryButton).toBeInTheDocument()
    expect(retryButton).toHaveTextContent('Retry')

    // Clicking retry should call listProjects again
    listProjects.mockClear()
    listProjects.mockResolvedValue([])
    await userEvent.click(retryButton)

    expect(listProjects).toHaveBeenCalledTimes(1)
  })

  test('creates project successfully and selects it', async () => {
    const newProject = { id: 'new-1', name: 'New Test Project', runCount: 0 }
    listProjects.mockResolvedValue([])
    createProject.mockResolvedValue(newProject)

    render(
      <FileInput
        onFilesReady={mockOnFilesReady}
        onSelectProject={mockOnSelectProject}
        onLoadRun={mockOnLoadRun}
        selectedProject={null}
      />
    )

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument()
    })

    // Click new project button
    await userEvent.click(screen.getByTestId('new-project-button'))

    // Modal should appear
    expect(screen.getByText('Create New Project')).toBeInTheDocument()

    // Fill in project name
    await userEvent.type(screen.getByTestId('project-name-input'), 'New Test Project')

    // Submit form
    await userEvent.click(screen.getByTestId('create-project-submit'))

    // Wait for project creation
    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith('New Test Project', '')
    })

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText('Create New Project')).not.toBeInTheDocument()
    })

    // onSelectProject should be called with new project
    expect(mockOnSelectProject).toHaveBeenCalledWith(newProject)
  })

  test('create project button is disabled when name is empty', async () => {
    listProjects.mockResolvedValue([])

    render(
      <FileInput
        onFilesReady={mockOnFilesReady}
        onSelectProject={mockOnSelectProject}
        onLoadRun={mockOnLoadRun}
        selectedProject={null}
      />
    )

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument()
    })

    // Open create modal
    await userEvent.click(screen.getByTestId('new-project-button'))

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText('Create New Project')).toBeInTheDocument()
    })

    // The submit button should be disabled when no name entered
    const submitButton = screen.getByTestId('create-project-submit')
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('Create')

    // createProject should not be called
    expect(createProject).not.toHaveBeenCalled()
  })

  test('disables file upload during analysis', async () => {
    const mockProject = { id: '1', name: 'Test Project', runCount: 0 }
    listProjects.mockResolvedValue([mockProject])
    listRuns.mockResolvedValue([])

    render(
      <FileInput
        onFilesReady={mockOnFilesReady}
        onSelectProject={mockOnSelectProject}
        onLoadRun={mockOnLoadRun}
        selectedProject={mockProject}
        analyzing={true}
      />
    )

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument()
    })

    // Should show analyzing indicator
    expect(screen.getByTestId('analyzing-indicator')).toBeInTheDocument()

    // Dropzone should show "Analyzing..." (get first occurrence)
    const analyzingElements = screen.getAllByText('Analyzing...')
    expect(analyzingElements.length).toBeGreaterThan(0)
  })

  test('selects project and loads runs', async () => {
    const mockProject = { id: '1', name: 'Test Project', runCount: 2 }
    const mockRuns = [
      { id: 'run-1', createdAt: new Date().toISOString(), stats: { totalFiles: 5, totalComponents: 3 } },
      { id: 'run-2', createdAt: new Date().toISOString(), stats: { totalFiles: 3, totalComponents: 2 } },
    ]

    listProjects.mockResolvedValue([mockProject])
    listRuns.mockResolvedValue(mockRuns)

    renderFileInput({ selectedProject: mockProject })

    // Wait for runs to load
    await waitFor(() => {
      expect(screen.queryByTestId('run-history-loading')).not.toBeInTheDocument()
    })

    // Should show run items
    expect(screen.getByTestId('run-item-run-1')).toBeInTheDocument()
    expect(screen.getByTestId('run-item-run-2')).toBeInTheDocument()

    // Should show run stats
    expect(screen.getByText('5 files')).toBeInTheDocument()
    expect(screen.getByText('3 comps')).toBeInTheDocument()
  })

  test('loads saved run when clicked', async () => {
    const mockProject = { id: '1', name: 'Test Project', runCount: 1 }
    const mockRun = {
      id: 'run-1',
      createdAt: new Date().toISOString(),
      stats: { totalFiles: 3, totalComponents: 2 },
      snapshot: { nodes: [], edges: [], depMap: {} },
      unresolvedImports: [],
      analysisErrors: []
    }

    listProjects.mockResolvedValue([mockProject])
    listRuns.mockResolvedValue([mockRun])
    getRun.mockResolvedValue(mockRun)

    renderFileInput({ selectedProject: mockProject })

    // Wait for runs to load
    await waitFor(() => {
      expect(screen.queryByTestId('run-history-loading')).not.toBeInTheDocument()
    })

    // Click on run item (button)
    await userEvent.click(screen.getByTestId('run-item-run-1'))

    // Wait for getRun to be called
    await waitFor(() => {
      expect(getRun).toHaveBeenCalledWith('run-1')
    })

    // onLoadRun should be called with snapshot
    await waitFor(() => {
      expect(mockOnLoadRun).toHaveBeenCalledWith(mockRun.snapshot, mockRun)
    })
  })

  test('system sidebar buttons open their panels', async () => {
    listProjects.mockResolvedValue([])
    const onTabChange = vi.fn()

    render(
      <FileInput
        onFilesReady={mockOnFilesReady}
        onSelectProject={mockOnSelectProject}
        onLoadRun={mockOnLoadRun}
        selectedProject={null}
        activeTab="Dashboard"
        onTabChange={onTabChange}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument()
    })

    // Components opens the library modal (empty state without a run)
    await userEvent.click(screen.getByTestId('system-components'))
    expect(screen.getByTestId('components-modal')).toBeInTheDocument()
    expect(screen.getByText(/Run an analysis to populate/i)).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('components-modal-close'))
    expect(screen.queryByTestId('components-modal')).not.toBeInTheDocument()

    // Graphs navigates to the Runs tab
    await userEvent.click(screen.getByTestId('system-graphs'))
    expect(onTabChange).toHaveBeenCalledWith('Runs')

    // Settings opens the settings modal with API key section + repo link
    await userEvent.click(screen.getByTestId('header-settings-button'))
    expect(screen.getByTestId('settings-modal')).toBeInTheDocument()
    expect(screen.getByText(/OpenRouter API Key/i)).toBeInTheDocument()
    expect(screen.getByTestId('settings-repo-link')).toHaveAttribute(
      'href',
      'https://github.com/Abhishek-Gharat/literate-engine'
    )
  })

  test('documentation link points at the repository', async () => {
    listProjects.mockResolvedValue([])
    renderFileInput({ selectedProject: null })

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument()
    })
    expect(screen.getByTestId('documentation-link')).toHaveAttribute(
      'href',
      'https://github.com/Abhishek-Gharat/literate-engine#readme'
    )
  })

  test('component library lists latest run files grouped by type', async () => {
    const mockProject = { id: '1', name: 'Test Project', runCount: 1 }
    listProjects.mockResolvedValue([mockProject])
    listRuns.mockResolvedValue([
      {
        id: 'run-1',
        createdAt: new Date().toISOString(),
        stats: { totalFiles: 3, totalComponents: 2 },
        snapshot: {
          nodes: [
            { id: 'src/App.jsx', type: 'component', isGhost: false, imports: ['./lib.js'], importedBy: [] },
            { id: 'src/lib.js', type: 'component', isGhost: false, imports: [], importedBy: ['src/App.jsx'] },
            { id: 'src/useThing.js', type: 'hook', isGhost: false, imports: [], importedBy: [] },
          ],
          edges: [],
        },
      },
    ])

    renderFileInput({ selectedProject: mockProject, activeTab: 'Dashboard' })

    await waitFor(() => {
      expect(screen.queryByTestId('run-history-loading')).not.toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('system-components'))

    const modal = screen.getByTestId('components-modal')
    expect(modal).toBeInTheDocument()
    expect(within(modal).getByText('src/useThing.js')).toBeInTheDocument()
    expect(within(modal).getByText('Hooks')).toBeInTheDocument()
  })

  test('shows runs error with retry button', async () => {
    const mockProject = { id: '1', name: 'Test Project', runCount: 0 }
    listProjects.mockResolvedValue([mockProject])
    listRuns.mockRejectedValue(new Error('Network error'))

    renderFileInput({ selectedProject: mockProject })

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByTestId('run-history-error')).toBeInTheDocument()
    })

    // Should show error message
    expect(screen.getByText(/Network error/i)).toBeInTheDocument()

    // Should have retry button
    const retryButton = screen.getByTestId('run-history-retry-button')
    expect(retryButton).toBeInTheDocument()

    // Click retry
    listRuns.mockClear()
    listRuns.mockResolvedValue([])
    await userEvent.click(retryButton)

    expect(listRuns).toHaveBeenCalledWith('1')
  })
})

import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createApp } from '../app.js'
import { closeDatabase } from '../db/init.js'

let server
let baseUrl

before(async () => {
  const app = createApp()

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address()
      baseUrl = `http://127.0.0.1:${port}`
      resolve()
    })
  })
})

after(async () => {
  closeDatabase()
  await new Promise((resolve) => server.close(resolve))
})

// ─── PROJECTS ───────────────────────────────────────

test('POST /api/projects creates a new project', async () => {
  const response = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `test-project-${Date.now()}`, description: 'A test project' }),
  })

  const body = await response.json()

  assert.equal(response.status, 201)
  assert.ok(body.id)
  assert.ok(body.name.startsWith('test-project-'))
  assert.equal(body.description, 'A test project')
  assert.ok(body.created_at)
  assert.ok(body.updated_at)
})

test('GET /api/projects lists all projects', async () => {
  // Create two projects
  await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'list-test-1' }),
  })

  await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'list-test-2' }),
  })

  const response = await fetch(`${baseUrl}/api/projects`)
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.ok(Array.isArray(body.projects))
  assert.ok(body.projects.length >= 2)
  assert.ok(body.projects.some((p) => p.name === 'list-test-1'))
  assert.ok(body.projects.some((p) => p.name === 'list-test-2'))
})

test('GET /api/projects/:id retrieves a project by ID', async () => {
  // Create a project
  const createResponse = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `get-test-project-${Date.now()}` }),
  })

  const created = await createResponse.json()
  const projectId = created.id

  // Retrieve it
  const response = await fetch(`${baseUrl}/api/projects/${projectId}`)
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.id, projectId)
  assert.ok(body.name.startsWith('get-test-project-'))
})

test('POST /api/projects rejects duplicate project names', async () => {
  const name = `unique-name-${Date.now()}`

  // Create first project
  await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })

  // Try to create duplicate
  const response = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })

  assert.equal(response.status, 400)
  const body = await response.json()
  const errorMsg = body.error?.message || body.message || ''
  assert.ok(errorMsg.toLowerCase().includes('unique') || errorMsg.toLowerCase().includes('exists'))
})

test('POST /api/projects rejects empty name', async () => {
  const response = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '' }),
  })

  assert.equal(response.status, 400)
  const body = await response.json()
  const errorMsg = body.error?.message || body.message || ''
  assert.ok(errorMsg.toLowerCase().includes('required'))
})

test('GET /api/projects/:id returns 404 for nonexistent project', async () => {
  const response = await fetch(`${baseUrl}/api/projects/nonexistent-id-xyz`)
  assert.equal(response.status, 400)
})

// ─── ANALYSIS RUNS ──────────────────────────────────

test('POST /api/analysis with projectId persists the run', async () => {
  // Create a project
  const projectResponse = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `persist-test-${Date.now()}` }),
  })

  const project = await projectResponse.json()
  const projectId = project.id

  // Run analysis with projectId
  const analysisResponse = await fetch(`${baseUrl}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId,
      files: [
        {
          name: 'App.jsx',
          content: "import Button from './Button'\nexport default function App() { return <Button /> }",
        },
        {
          name: 'Button.jsx',
          content: 'export default function Button() { return null }',
        },
      ],
    }),
  })

  const analysis = await analysisResponse.json()

  assert.equal(analysisResponse.status, 200)
  assert.ok(analysis.runId)
  assert.ok(analysis.nodes)
  assert.ok(analysis.edges)
  assert.ok(analysis.stats)
})

test('GET /api/runs/:id retrieves a persisted analysis run', async () => {
  // Create a project
  const projectResponse = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `get-run-test-${Date.now()}` }),
  })

  const project = await projectResponse.json()
  const projectId = project.id

  // Run analysis
  const analysisResponse = await fetch(`${baseUrl}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId,
      files: [
        {
          name: 'App.jsx',
          content: "import Button from './Button'\nexport default function App() { return <Button /> }",
        },
        {
          name: 'Button.jsx',
          content: 'export default function Button() { return null }',
        },
      ],
    }),
  })

  const analysis = await analysisResponse.json()
  const runId = analysis.runId

  // Retrieve the run
  const runResponse = await fetch(`${baseUrl}/api/runs/${runId}`)
  const run = await runResponse.json()

  assert.equal(runResponse.status, 200)
  assert.equal(run.id, runId)
  assert.equal(run.projectId, projectId)
  assert.ok(run.createdAt)
  assert.ok(run.snapshot)
  assert.ok(run.stats)
})

test('GET /api/projects/:id/runs lists analysis runs for a project', async () => {
  // Create a project
  const projectResponse = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `list-runs-test-${Date.now()}` }),
  })

  const project = await projectResponse.json()
  const projectId = project.id

  // Run analysis twice
  await fetch(`${baseUrl}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId,
      files: [{ name: 'App.jsx', content: 'export default function App() {}' }],
    }),
  })

  await fetch(`${baseUrl}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId,
      files: [{ name: 'Button.jsx', content: 'export default function Button() {}' }],
    }),
  })

  // List runs
  const runsResponse = await fetch(`${baseUrl}/api/projects/${projectId}/runs`)
  const runsData = await runsResponse.json()

  assert.equal(runsResponse.status, 200)
  assert.ok(Array.isArray(runsData.runs))
  assert.equal(runsData.runs.length, 2)
  assert.ok(runsData.runs[0].createdAt)
  assert.ok(runsData.runs[0].stats)
})

test('GET /api/projects/:id/runs returns 400 for nonexistent project', async () => {
  const response = await fetch(`${baseUrl}/api/projects/nonexistent-id/runs`)
  assert.equal(response.status, 400)
})

test('GET /api/runs/:id returns 400 for nonexistent run', async () => {
  const response = await fetch(`${baseUrl}/api/runs/nonexistent-run-id`)
  assert.equal(response.status, 400)
})

test('POST /api/analysis without projectId still works', async () => {
  const response = await fetch(`${baseUrl}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: [
        {
          name: 'App.jsx',
          content: 'export default function App() {}',
        },
      ],
    }),
  })

  const body = await response.json()

  assert.equal(response.status, 200)
  assert.ok(body.nodes)
  assert.ok(body.edges)
  assert.ok(body.stats)
  assert.ok(!body.runId) // No runId when not persisted
})

test('POST /api/analysis rejects nonexistent projectId', async () => {
  const response = await fetch(`${baseUrl}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: 'nonexistent-project-id',
      files: [
        {
          name: 'App.jsx',
          content: 'export default function App() {}',
        },
      ],
    }),
  })

  assert.equal(response.status, 400)
  const body = await response.json()
  const errorMsg = body.error?.message || body.message || ''
  assert.ok(errorMsg.toLowerCase().includes('not found'))
})

test('Analysis run snapshot preserves full graph data', async () => {
  // Create a project
  const projectResponse = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `snapshot-test-${Date.now()}` }),
  })

  const project = await projectResponse.json()
  const projectId = project.id

  // Run analysis with complex code
  const analysisResponse = await fetch(`${baseUrl}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId,
      files: [
        {
          name: 'App.jsx',
          content: "import Button from './Button'\nimport useCounter from './useCounter'\nexport default function App() { return <Button /> }",
        },
        {
          name: 'Button.jsx',
          content: "import useCounter from './useCounter'\nexport default function Button() { return null }",
        },
        {
          name: 'useCounter.js',
          content: 'export default function useCounter() { return 0 }',
        },
      ],
    }),
  })

  const analysis = await analysisResponse.json()
  const runId = analysis.runId

  // Retrieve and verify snapshot
  const runResponse = await fetch(`${baseUrl}/api/runs/${runId}`)
  const run = await runResponse.json()

  assert.ok(run.snapshot.nodes)
  assert.ok(run.snapshot.edges)
  assert.ok(run.snapshot.depMap)
  assert.equal(run.snapshot.nodes.length, 3)
  assert.ok(run.snapshot.edges.length >= 2)
  assert.deepEqual(Object.keys(run.snapshot.depMap).sort(), ['App.jsx', 'Button.jsx', 'useCounter.js'])
})

test('Projects list includes runCount', async () => {
  // Create project
  const projectResponse = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `run-count-test-${Date.now()}` }),
  })

  const project = await projectResponse.json()
  const projectId = project.id

  // Run analysis 3 times
  for (let i = 0; i < 3; i++) {
    await fetch(`${baseUrl}/api/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        files: [{ name: 'App.jsx', content: 'export default function App() {}' }],
      }),
    })
  }

  // Check projects list
  const listResponse = await fetch(`${baseUrl}/api/projects`)
  const { projects } = await listResponse.json()

  const foundProject = projects.find((p) => p.id === projectId)
  assert.ok(foundProject)
  assert.equal(foundProject.runCount, 3)
})

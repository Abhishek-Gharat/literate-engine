import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createApp } from '../app.js'

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
  await new Promise((resolve) => server.close(resolve))
})

test('POST /api/analysis returns canonical graph JSON', async () => {
  const response = await fetch(`${baseUrl}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: [
        {
          name: 'App.jsx',
          content: "import Button from './Button'\nexport default function App() { return <Button /> }",
        },
        {
          name: 'Button.jsx',
          content: "import App from './App'\nexport default function Button() { return <button /> }",
        },
      ],
    }),
  })

  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.stats.totalFiles, 2)
  assert.equal(body.stats.totalEdges, 2)
  assert.equal(body.stats.cyclesFound, 1)
  assert.deepEqual(Object.keys(body.depMap).sort(), ['App.jsx', 'Button.jsx'])
  assert.equal(body.unresolvedImports.length, 0)
  assert.equal(body.analysisErrors.length, 0)
  assert.ok(body.nodes.some((node) => node.id === 'App.jsx'))
  assert.ok(body.edges.some((edge) => edge.source === 'App.jsx' && edge.target === 'Button.jsx'))
})

test('GET / returns service metadata', async () => {
  const response = await fetch(`${baseUrl}/`)
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.service, 'ReactViz API')
  assert.equal(body.status, 'ok')
  assert.equal(body.endpoints.health, '/health')
  assert.equal(body.endpoints.analysis, '/api/analysis')
})

test('POST /api/analysis accepts repository snapshot files', async () => {
  const response = await fetch(`${baseUrl}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repository: {
        provider: 'local',
        files: [
          {
            path: 'src/App.jsx',
            content: "import Header from './Header'\nexport default function App() { return <Header /> }",
          },
          {
            path: 'src/Header.jsx',
            content: 'export default function Header() { return null }',
          },
        ],
      },
    }),
  })

  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.stats.totalFiles, 2)
  assert.equal(body.depMap['src/App.jsx'][0], 'src/Header.jsx')
})

test('POST /api/analysis rejects invalid payloads with normalized errors', async () => {
  const response = await fetch(`${baseUrl}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: [] }),
  })

  const body = await response.json()

  assert.equal(response.status, 400)
  assert.equal(body.error.code, 'BAD_REQUEST')
  assert.equal(typeof body.error.message, 'string')
  assert.equal(typeof body.error.requestId, 'string')
  assert.ok(Array.isArray(body.error.details))
})

test('POST /api/analysis rejects oversized JSON bodies', async () => {
  const response = await fetch(`${baseUrl}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: [
        {
          name: 'Large.jsx',
          content: 'x'.repeat(1024 * 1024),
        },
      ],
    }),
  })

  const body = await response.json()

  assert.equal(response.status, 413)
  assert.equal(body.error.code, 'PAYLOAD_TOO_LARGE')
  assert.equal(typeof body.error.requestId, 'string')
})

test('POST /api/analysis reports malicious, duplicate, malformed, and unsupported files without crashing', async () => {
  const response = await fetch(`${baseUrl}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: [
        {
          path: '../../secret.js',
          content: 'export const secret = true',
        },
        {
          path: 'src\\App.jsx',
          content: "import Header from './Header'\nexport default function App() { return <Header /> }",
        },
        {
          path: 'SRC/App.jsx',
          content: 'export default function Duplicate() { return null }',
        },
        {
          path: 'src/styles.css',
          content: '.root { color: red; }',
        },
        {
          path: 'src/Header.jsx',
          content: 'export default function Header() { return null }',
        },
        [],
      ],
    }),
  })

  const body = await response.json()
  const errorCodes = body.analysisErrors.map((error) => error.code)

  assert.equal(response.status, 200)
  assert.equal(body.stats.totalFiles, 2)
  assert.deepEqual(Object.keys(body.depMap).sort(), ['src/App.jsx', 'src/Header.jsx'])
  assert.ok(errorCodes.includes('INVALID_FILE_PATH'))
  assert.ok(errorCodes.includes('DUPLICATE_FILE_PATH'))
  assert.ok(errorCodes.includes('UNSUPPORTED_FILE_TYPE'))
  assert.ok(errorCodes.includes('MALFORMED_FILE_OBJECT'))
  assert.ok(!body.nodes.some((node) => node.id.includes('..')))
})

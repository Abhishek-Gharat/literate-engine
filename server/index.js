import { createApp } from './app.js'
import { closeDatabase } from './db/init.js'

const port = Number(process.env.PORT || 4000)
const nodeEnv = process.env.NODE_ENV || 'development'

console.log('[STARTUP] ═══════════════════════════════════════')
console.log('[STARTUP] ReactViz API Server Starting')
console.log('[STARTUP] Environment:', nodeEnv)
console.log('[STARTUP] Port:', port)
console.log('[STARTUP] Node Version:', process.version)
console.log('[STARTUP] CWD:', process.cwd())
if (process.env.DATA_DIR) {
  console.log('[STARTUP] Custom Data Dir:', process.env.DATA_DIR)
}
console.log('[STARTUP] ═══════════════════════════════════════')

let app
let server

try {
  console.log('[STARTUP] Creating Express app...')
  app = createApp()
  console.log('[STARTUP] ✓ Express app created successfully')
} catch (error) {
  console.error('[STARTUP] ✗ Failed to create app:', error.message)
  console.error('[STARTUP] Stack:', error.stack)
  process.exit(1)
}

try {
  console.log('[STARTUP] Starting server on port', port)
  server = app.listen(port, () => {
    console.log('[STARTUP] ═══════════════════════════════════════')
    console.log('[STARTUP] ✓ Server is listening')
    console.log('[STARTUP] ✓ http://localhost:' + port)
    console.log('[STARTUP] ✓ Health check: /health')
    console.log('[STARTUP] ✓ API root: /api')
    console.log('[STARTUP] ═══════════════════════════════════════')
  })
} catch (error) {
  console.error('[STARTUP] ✗ Failed to start server:', error.message)
  process.exit(1)
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SHUTDOWN] SIGTERM received, shutting down gracefully...')
  server.close(() => {
    closeDatabase()
    console.log('[SHUTDOWN] Database closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[SHUTDOWN] SIGINT received, shutting down gracefully...')
  server.close(() => {
    closeDatabase()
    console.log('[SHUTDOWN] Database closed')
    process.exit(0)
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[ERROR] Uncaught Exception:', error.message)
  console.error('[ERROR] Stack:', error.stack)
  process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

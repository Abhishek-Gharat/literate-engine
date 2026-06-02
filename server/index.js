import { createApp } from './app.js'
import { closeDatabase } from './db/init.js'

const port = Number(process.env.PORT || 4000)
const app = createApp()

const server = app.listen(port, () => {
  console.log(`ReactViz API listening on http://localhost:${port}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  server.close(() => {
    closeDatabase()
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  server.close(() => {
    closeDatabase()
    process.exit(0)
  })
})

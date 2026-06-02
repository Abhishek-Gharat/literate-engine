import express from 'express'
import helmet from 'helmet'
import { initializeDatabase } from './db/init.js'
import analysisRoutes from './routes/analysisRoutes.js'
import projectsRoutes from './routes/projectsRoutes.js'
import runsRoutes from './routes/runsRoutes.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'
import { analysisRateLimit } from './middleware/analysisRateLimit.js'
import { requestContext, requestLogger } from './middleware/requestContext.js'

export function createApp() {
  // Initialize database
  initializeDatabase()

  const app = express()

  app.disable('x-powered-by')
  app.use(helmet())
  app.use(requestContext)
  app.use(requestLogger)
  app.use(express.json({ limit: '1mb', strict: true }))

  app.get('/', (req, res) => {
    res.json({
      service: 'ReactViz API',
      status: 'ok',
      version: '0.0.0',
      endpoints: {
        health: '/health',
        analysis: '/api/analysis',
        projects: '/api/projects',
        runs: '/api/runs',
      },
    })
  })

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/api/analysis', analysisRateLimit, analysisRoutes)
  app.use('/api/projects', projectsRoutes)
  
  // Nested route: /api/projects/:projectId/runs
  app.use('/api/projects/:projectId/runs', runsRoutes)
  
  // Direct runs routes: /api/runs/:id
  app.use('/api/runs', runsRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

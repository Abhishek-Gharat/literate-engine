import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { initializeDatabase, getDatabase } from './db/init.js'
import analysisRoutes from './routes/analysisRoutes.js'
import projectsRoutes from './routes/projectsRoutes.js'
import runsRoutes from './routes/runsRoutes.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'
import { analysisRateLimit } from './middleware/analysisRateLimit.js'
import { requestContext, requestLogger } from './middleware/requestContext.js'

export function createApp() {
  // Initialize database with error handling
  let dbInitialized = false
  let dbError = null
  
  console.log('[APP] Initializing database...')
  try {
    initializeDatabase()
    dbInitialized = true
    console.log('[APP] ✓ Database initialized successfully')
  } catch (error) {
    dbError = error
    console.error('[APP] ✗ Database initialization error (non-fatal):', error.message)
    // Continue anyway - we'll report the error in the health check
  }

  const app = express()

  app.disable('x-powered-by')
  app.use(helmet())
  
  // Configure CORS
  const corsOrigins = [
    'https://literate-engine-git-master-abhishek-gharats-projects.vercel.app',
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Alternative local dev
  ]
  app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))
  
  app.use(requestContext)
  app.use(requestLogger)
  app.use(express.json({ limit: '1mb', strict: true }))

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      service: 'ReactViz API',
      status: dbInitialized ? 'ok' : 'degraded',
      version: '0.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbInitialized ? 'connected' : 'error',
      endpoints: {
        health: '/health',
        root: '/',
        analysis: '/api/analysis',
        projects: '/api/projects',
        runs: '/api/runs',
      },
    })
  })

  // Health endpoint - always responds
  app.get('/health', (req, res) => {
    if (dbInitialized) {
      try {
        const db = getDatabase()
        // Quick database connectivity check
        db.prepare('SELECT 1').get()
        res.status(200).json({
          status: 'healthy',
          database: 'connected',
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          database: 'error',
          error: error.message,
          timestamp: new Date().toISOString(),
        })
      }
    } else {
      const status = dbError ? 503 : 200
      res.status(status).json({
        status: dbError ? 'unhealthy' : 'starting',
        database: 'not-initialized',
        ...(dbError ? { error: dbError.message } : {}),
        timestamp: new Date().toISOString(),
      })
    }
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

import { Router } from 'express'
import { getAnalysisRun, listAnalysisRuns } from '../db/queries.js'
import { BadRequestError } from '../errors/ApiError.js'

const router = Router({ mergeParams: true })

// GET /api/projects/:projectId/runs or /api/runs/project/:projectId – List analysis runs for a project
router.get('/', (req, res, next) => {
  try {
    const projectId = req.params.projectId
    if (!projectId) {
      throw new BadRequestError('Project ID is required.')
    }

    try {
      const runs = listAnalysisRuns(projectId)
      res.status(200).json({ runs })
    } catch (error) {
      if (error.code === 'PROJECT_NOT_FOUND') {
        throw new BadRequestError(error.message)
      }
      throw error
    }
  } catch (error) {
    next(error)
  }
})

// GET /api/runs/:id – Get a single analysis run
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params
    const run = getAnalysisRun(id)

    if (!run) {
      throw new BadRequestError(`Analysis run not found: ${id}`)
    }

    res.status(200).json(run)
  } catch (error) {
    next(error)
  }
})

export default router

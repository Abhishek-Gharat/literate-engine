import { Router } from 'express'
import { createProject, getProject, listProjects } from '../db/queries.js'
import { BadRequestError } from '../errors/ApiError.js'

const router = Router()

// POST /api/projects – Create a new project
router.post('/', (req, res, next) => {
  try {
    const { name, description } = req.body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new BadRequestError('Project name is required and must be a non-empty string.')
    }

    if (name.length > 255) {
      throw new BadRequestError('Project name must be 255 characters or fewer.')
    }

    if (description && (typeof description !== 'string' || description.length > 500)) {
      throw new BadRequestError('Project description must be 500 characters or fewer.')
    }

    try {
      const project = createProject(name.trim(), description || null)
      res.status(201).json(project)
    } catch (dbError) {
      if (dbError.code === 'DUPLICATE_PROJECT_NAME') {
        throw new BadRequestError(dbError.message)
      }
      throw dbError
    }
  } catch (error) {
    next(error)
  }
})

// GET /api/projects – List all projects
router.get('/', (req, res, next) => {
  try {
    const projects = listProjects()
    res.status(200).json({ projects })
  } catch (error) {
    next(error)
  }
})

// GET /api/projects/:id – Get a single project
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params

    const project = getProject(id)
    if (!project) {
      throw new BadRequestError(`Project not found: ${id}`)
    }

    res.status(200).json(project)
  } catch (error) {
    next(error)
  }
})

export default router

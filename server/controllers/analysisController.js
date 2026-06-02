import { runAnalysis } from '../services/analysisService.js'
import { validateAnalysisRequest } from '../validation/analysisRequest.js'
import { BadRequestError } from '../errors/ApiError.js'
import { normalizeAnalysisFiles } from '../validation/fileNormalizer.js'
import { createAnalysisRun, getProject } from '../db/queries.js'

export function analyzeProjectController(req, res, next) {
  try {
    const validation = validateAnalysisRequest(req.body)

    if (!validation.valid) {
      throw new BadRequestError('The analysis request payload is malformed.', validation.errors)
    }

    const normalized = normalizeAnalysisFiles(validation.files)
    const result = runAnalysis(normalized.files, normalized.analysisErrors)

    // If projectId provided, persist the analysis run
    if (req.body.projectId) {
      const projectId = req.body.projectId

      // Validate project exists
      const project = getProject(projectId)
      if (!project) {
        throw new BadRequestError(`Project not found: ${projectId}`)
      }

      // Validate snapshot size (prevent oversized payloads)
      const snapshotStr = JSON.stringify(result)
      if (snapshotStr.length > 5 * 1024 * 1024) {
        throw new BadRequestError('Analysis snapshot exceeds maximum size of 5MB.')
      }

      try {
        const run = createAnalysisRun(
          projectId,
          result,
          result.stats,
          result.unresolvedImports,
          result.analysisErrors
        )
        return res.status(200).json({ ...result, runId: run.id })
      } catch (error) {
        if (error.code === 'PROJECT_NOT_FOUND') {
          throw new BadRequestError(`Project not found: ${projectId}`)
        }
        throw error
      }
    }

    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

import { analyzeProject } from '../../src/analysis/engine.js'
import { AnalysisEngineError } from '../errors/ApiError.js'

export function runAnalysis(files, initialAnalysisErrors = []) {
  try {
    return analyzeProject(files, { initialAnalysisErrors })
  } catch (error) {
    throw new AnalysisEngineError(error.message)
  }
}

export class ApiError extends Error {
  constructor({ code, message, status = 500, details = undefined }) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.status = status
    this.details = details
  }
}

export class BadRequestError extends ApiError {
  constructor(message, details) {
    super({
      code: 'BAD_REQUEST',
      message,
      status: 400,
      details,
    })
  }
}

export class AnalysisEngineError extends ApiError {
  constructor(message = 'The analysis engine could not complete the request.') {
    super({
      code: 'ANALYSIS_ENGINE_ERROR',
      message,
      status: 500,
    })
  }
}

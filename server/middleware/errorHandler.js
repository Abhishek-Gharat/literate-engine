import { ApiError } from '../errors/ApiError.js'

function toErrorResponse(error, requestId) {
  const isApiError = error instanceof ApiError
  const status = isApiError ? error.status : 500
  const code = isApiError ? error.code : 'INTERNAL_SERVER_ERROR'
  const message = isApiError
    ? error.message
    : 'The API could not complete the request.'

  return {
    status,
    body: {
      error: {
        code,
        message,
        requestId,
        ...(error.details ? { details: error.details } : {}),
      },
    },
  }
}

export function notFoundHandler(req, res) {
  const { body } = toErrorResponse(new ApiError({
    code: 'NOT_FOUND',
    message: 'Route not found.',
    status: 404,
  }), req.id)

  res.status(404).json(body)
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  let normalizedError = error

  if (error?.type === 'entity.too.large') {
    normalizedError = new ApiError({
      code: 'PAYLOAD_TOO_LARGE',
      message: 'JSON request body exceeds the allowed size.',
      status: 413,
    })
  } else if (error instanceof SyntaxError && 'body' in error) {
    normalizedError = new ApiError({
      code: 'INVALID_JSON',
      message: 'Request body must be valid JSON.',
      status: 400,
    })
  }

  const { status, body } = toErrorResponse(normalizedError, req.id)

  if (status >= 500) {
    console.error(JSON.stringify({
      requestId: req.id,
      code: body.error.code,
      message: normalizedError.message,
      stack: normalizedError.stack,
    }))
  }

  return res.status(status).json(body)
}

import { randomUUID } from 'node:crypto'

export function requestContext(req, res, next) {
  const inboundId = req.get('x-request-id')
  req.id = inboundId && inboundId.length <= 128 ? inboundId : randomUUID()
  res.setHeader('x-request-id', req.id)
  next()
}

export function requestLogger(req, res, next) {
  const startedAt = Date.now()

  res.on('finish', () => {
    console.log(JSON.stringify({
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    }))
  })

  next()
}

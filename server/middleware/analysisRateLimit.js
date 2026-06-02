import rateLimit from 'express-rate-limit'
import { ApiError } from '../errors/ApiError.js'

export const analysisRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError({
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many analysis requests. Please retry shortly.',
      status: 429,
    }))
  },
})

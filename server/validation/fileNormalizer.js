import path from 'node:path'

const SUPPORTED_SOURCE_EXTENSIONS = /\.(jsx?|tsx?)$/i
const SUPPORTED_CONFIG_FILES = /(^|\/)(tsconfig|jsconfig)\.json$/i
const MAX_FILE_BYTES = 512 * 1024

function rawFilePath(file) {
  return file?.path || file?.fullPath || file?.name
}

export function normalizeFilePath(value) {
  if (typeof value !== 'string') return null

  const withoutNullBytes = value.replace(/\0/g, '')
  const withoutDrive = withoutNullBytes.replace(/^[a-zA-Z]:[\\/]+/, '')
  const slashNormalized = withoutDrive.replace(/\\/g, '/').replace(/\/+/g, '/').trim()
  const normalized = path.posix.normalize(slashNormalized)

  if (!normalized || normalized === '.' || normalized.startsWith('../') || normalized === '..') {
    return null
  }

  return normalized.replace(/^\/+/, '')
}

export function normalizeAnalysisFiles(files) {
  const analysisErrors = []
  const normalizedFiles = []
  const seen = new Map()

  files.forEach((file, index) => {
    if (!file || typeof file !== 'object' || Array.isArray(file)) {
      analysisErrors.push({
        code: 'MALFORMED_FILE_OBJECT',
        message: 'File entry must be an object.',
        index,
      })
      return
    }

    const normalizedPath = normalizeFilePath(rawFilePath(file))

    if (!normalizedPath) {
      analysisErrors.push({
        code: 'INVALID_FILE_PATH',
        message: 'File path is missing, empty, or uses path traversal.',
        index,
      })
      return
    }

    if (typeof file.content !== 'string') {
      analysisErrors.push({
        code: 'INVALID_FILE_CONTENT',
        message: 'File content must be a string.',
        file: normalizedPath,
      })
      return
    }

    const fileBytes = Buffer.byteLength(file.content, 'utf8')
    if (fileBytes > MAX_FILE_BYTES) {
      analysisErrors.push({
        code: 'FILE_TOO_LARGE',
        message: `File content exceeds ${MAX_FILE_BYTES} bytes.`,
        file: normalizedPath,
      })
      return
    }

    if (!SUPPORTED_SOURCE_EXTENSIONS.test(normalizedPath) && !SUPPORTED_CONFIG_FILES.test(normalizedPath)) {
      analysisErrors.push({
        code: 'UNSUPPORTED_FILE_TYPE',
        message: 'Only .js, .jsx, .ts, and .tsx files are analyzed.',
        file: normalizedPath,
      })
      return
    }

    const duplicateKey = normalizedPath.toLowerCase()
    if (seen.has(duplicateKey)) {
      analysisErrors.push({
        code: 'DUPLICATE_FILE_PATH',
        message: 'Duplicate file path skipped after slash and casing normalization.',
        file: normalizedPath,
        duplicateOf: seen.get(duplicateKey),
      })
      return
    }

    seen.set(duplicateKey, normalizedPath)
    normalizedFiles.push({
      name: normalizedPath,
      content: file.content,
    })
  })

  return {
    files: normalizedFiles,
    analysisErrors,
  }
}

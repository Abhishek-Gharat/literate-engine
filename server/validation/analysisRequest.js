const MAX_FILES = 500
const MAX_TOTAL_BYTES = 10 * 1024 * 1024

function getPayloadFiles(payload) {
  if (Array.isArray(payload?.files)) return payload.files
  if (Array.isArray(payload?.repository?.files)) return payload.repository.files
  return null
}

function getFileName(file) {
  return file?.path || file?.fullPath || file?.name
}

export function validateAnalysisRequest(payload) {
  const errors = []
  const files = getPayloadFiles(payload)

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      valid: false,
      errors: [{ field: 'body', message: 'Request body must be a JSON object.' }],
      files: [],
    }
  }

  if (!Array.isArray(files)) {
    errors.push({
      field: 'files',
      message: 'Provide files as an array or repository.files as an array.',
    })
  } else {
    if (files.length === 0) {
      errors.push({ field: 'files', message: 'At least one file is required.' })
    }

    if (files.length > MAX_FILES) {
      errors.push({
        field: 'files',
        message: `A maximum of ${MAX_FILES} files can be analyzed per request.`,
      })
    }

    let totalBytes = 0

    files.forEach((file) => {
      if (!file || typeof file !== 'object' || Array.isArray(file)) {
        return
      }

      if (typeof getFileName(file) === 'string' && typeof file.content === 'string') {
        totalBytes += Buffer.byteLength(file.content, 'utf8')
      }
    })

    if (totalBytes > MAX_TOTAL_BYTES) {
      errors.push({
        field: 'files',
        message: `Total request content exceeds ${MAX_TOTAL_BYTES} bytes.`,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    files: files || [],
  }
}

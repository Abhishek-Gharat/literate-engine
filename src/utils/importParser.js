import { getNodeType } from './nodeTypeClassifier.js'
import { parse } from '@babel/parser'

const SOURCE_EXTENSIONS = ['.jsx', '.js', '.tsx', '.ts']
const ASSET_EXTENSIONS = new Set([
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.json',
])

function normalizePath(value) {
  return value.replace(/\\/g, '/').replace(/\/+/g, '/')
}

function normalizePosix(value) {
  const absolute = value.startsWith('/')
  const parts = []

  normalizePath(value).split('/').forEach((part) => {
    if (!part || part === '.') return
    if (part === '..') {
      parts.pop()
      return
    }
    parts.push(part)
  })

  return `${absolute ? '/' : ''}${parts.join('/')}` || '.'
}

function dirname(filePath) {
  const normalized = normalizePath(filePath)
  const index = normalized.lastIndexOf('/')
  const dir = index === -1 ? '.' : normalized.slice(0, index)
  return dir === '.' ? '' : dir
}

function joinPath(...parts) {
  return normalizePosix(parts.filter(Boolean).join('/'))
}

function isRelativeImport(specifier) {
  return specifier.startsWith('./') || specifier.startsWith('../')
}

function extensionOf(specifier) {
  const clean = specifier.split('?')[0]
  const basename = clean.split('/').pop() || ''
  const dotIndex = basename.lastIndexOf('.')
  return dotIndex === -1 ? '' : basename.slice(dotIndex)
}

function isAssetImport(specifier) {
  return ASSET_EXTENSIONS.has(extensionOf(specifier).toLowerCase())
}

function isLikelyAlias(specifier) {
  return specifier.startsWith('@/') || specifier.startsWith('~/') || specifier.includes('/')
}

function createParserPlugins(filename) {
  const plugins = [
    'jsx',
    'dynamicImport',
    'importAssertions',
    'importAttributes',
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'objectRestSpread',
    'optionalChaining',
    'nullishCoalescingOperator',
  ]

  if (/\.(ts|tsx)$/.test(filename)) {
    plugins.push('typescript')
  }

  return plugins
}

function parseSource(file) {
  return parse(file.content, {
    sourceType: 'unambiguous',
    plugins: createParserPlugins(file.name),
  })
}

function literalValue(node) {
  if (!node) return null
  if (node.type === 'StringLiteral') return node.value
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value
  return null
}

function visitAst(node, visitor) {
  if (!node || typeof node !== 'object') return

  visitor(node)

  Object.entries(node).forEach(([key, value]) => {
    if (
      key === 'loc' ||
      key === 'start' ||
      key === 'end' ||
      key === 'extra' ||
      key === 'leadingComments' ||
      key === 'trailingComments' ||
      key === 'innerComments'
    ) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((child) => visitAst(child, visitor))
    } else if (value && typeof value === 'object' && typeof value.type === 'string') {
      visitAst(value, visitor)
    }
  })
}

function createImportRecord({ source, specifier, importType }) {
  return {
    source,
    specifier,
    importType,
  }
}

export function parseImportRecords(files) {
  const records = []
  const analysisErrors = []

  files.forEach((file) => {
    try {
      const ast = parseSource(file)

      visitAst(ast, (node) => {
        if (node.type === 'ImportDeclaration') {
          records.push(createImportRecord({
            source: file.name,
            specifier: node.source.value,
            importType: 'static-import',
          }))
          return
        }

        if (
          (node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration') &&
          node.source?.value
        ) {
          records.push(createImportRecord({
            source: file.name,
            specifier: node.source.value,
            importType: 'static-import',
          }))
          return
        }

        if (node.type === 'CallExpression' && node.callee?.type === 'Identifier' && node.callee.name === 'require') {
          const specifier = literalValue(node.arguments?.[0])
          if (specifier) {
            records.push(createImportRecord({
              source: file.name,
              specifier,
              importType: 'require',
            }))
          }
          return
        }

        if (node.type === 'CallExpression' && node.callee?.type === 'Import') {
          const specifier = literalValue(node.arguments?.[0])
          if (specifier) {
            records.push(createImportRecord({
              source: file.name,
              specifier,
              importType: 'dynamic-import',
            }))
          } else {
            analysisErrors.push({
              code: 'DYNAMIC_IMPORT_EXPRESSION',
              message: 'Dynamic import uses a non-literal expression and cannot be resolved statically.',
              file: file.name,
            })
          }
          return
        }

        if (node.type === 'ImportExpression') {
          const specifier = literalValue(node.source)
          if (specifier) {
            records.push(createImportRecord({
              source: file.name,
              specifier,
              importType: 'dynamic-import',
            }))
          } else {
            analysisErrors.push({
              code: 'DYNAMIC_IMPORT_EXPRESSION',
              message: 'Dynamic import uses a non-literal expression and cannot be resolved statically.',
              file: file.name,
            })
          }
        }
      })
    } catch (error) {
      analysisErrors.push({
        code: 'PARSE_ERROR',
        message: error.message,
        file: file.name,
      })
    }
  })

  return {
    records,
    analysisErrors,
  }
}

function parseJsonConfig(file) {
  try {
    return JSON.parse(file.content)
  } catch {
    return null
  }
}

function buildAliasRules(files) {
  const configFile = files.find((file) => /(^|\/)(tsconfig|jsconfig)\.json$/i.test(file.name))
  const config = configFile ? parseJsonConfig(configFile) : null
  const compilerOptions = config?.compilerOptions || {}
  const baseUrl = normalizePath(compilerOptions.baseUrl || '.')
  const paths = compilerOptions.paths || {}

  return Object.entries(paths).flatMap(([aliasPattern, targets]) => {
    if (!Array.isArray(targets)) return []

    const aliasPrefix = aliasPattern.replace(/\*.*$/, '')
    return targets.map((targetPattern) => ({
      aliasPattern,
      aliasPrefix,
      targetPattern,
      baseUrl,
    }))
  })
}

function applyAlias(specifier, aliasRules) {
  for (const rule of aliasRules) {
    if (!specifier.startsWith(rule.aliasPrefix)) continue

    const suffix = specifier.slice(rule.aliasPrefix.length)
    const target = rule.targetPattern.replace(/\*.*$/, suffix)
    return joinPath(rule.baseUrl === '.' ? '' : rule.baseUrl, target)
  }

  return null
}

function createFileLookup(fileNames) {
  const lookup = new Map()
  fileNames.forEach((fileName) => {
    lookup.set(normalizePath(fileName), normalizePath(fileName))
  })
  return lookup
}

function resolutionCandidates(basePath) {
  const normalized = normalizePath(basePath)
  const ext = extensionOf(normalized)
  const candidates = []

  if (ext) {
    candidates.push(normalized)
  } else {
    SOURCE_EXTENSIONS.forEach((sourceExt) => candidates.push(`${normalized}${sourceExt}`))
  }

  SOURCE_EXTENSIONS.forEach((sourceExt) => candidates.push(`${normalized}/index${sourceExt}`))

  return candidates
}

function resolveCandidate(basePath, fileLookup) {
  return resolutionCandidates(basePath).find((candidate) => fileLookup.has(candidate)) || null
}

function unresolvedTarget(source, specifier) {
  if (isRelativeImport(specifier)) {
    return joinPath(dirname(source), specifier)
  }

  return specifier
}

export function resolveImportRecords(records, files) {
  const sourceFileNames = files
    .map((file) => file.name)
    .filter((fileName) => SOURCE_EXTENSIONS.some((ext) => fileName.endsWith(ext)))
  const fileLookup = createFileLookup(sourceFileNames)
  const aliasRules = buildAliasRules(files)
  const resolvedRecords = []
  const analysisErrors = []

  records.forEach((record) => {
    const { source, specifier, importType } = record

    if (isAssetImport(specifier)) {
      analysisErrors.push({
        code: 'UNSUPPORTED_ASSET_IMPORT',
        message: 'Asset imports are reported but excluded from the dependency graph.',
        file: source,
        importPath: specifier,
      })
      return
    }

    let basePath = null
    let shouldReportUnresolved = false

    if (isRelativeImport(specifier)) {
      basePath = joinPath(dirname(source), specifier)
      shouldReportUnresolved = true
    } else {
      basePath = applyAlias(specifier, aliasRules)
      shouldReportUnresolved = Boolean(basePath) || isLikelyAlias(specifier)
    }

    if (!basePath) {
      return
    }

    const resolvedTarget = resolveCandidate(basePath, fileLookup)
    resolvedRecords.push({
      ...record,
      target: resolvedTarget || unresolvedTarget(source, specifier),
      resolved: Boolean(resolvedTarget),
      edgeType: resolvedTarget ? importType : 'unresolved',
    })

    if (!resolvedTarget && shouldReportUnresolved) {
      analysisErrors.push({
        code: 'UNRESOLVED_IMPORT',
        message: 'Import could not be resolved to a submitted source file.',
        file: source,
        importPath: specifier,
        importType,
        resolvedAs: unresolvedTarget(source, specifier),
      })
    }
  })

  return {
    records: resolvedRecords,
    analysisErrors,
  }
}

export function recordsToDepMap(records) {
  return records.reduce((depMap, record) => {
    if (!depMap[record.source]) {
      depMap[record.source] = []
    }

    depMap[record.source].push(record.target)
    return depMap
  }, {})
}

export function parseImports(files) {
  const { records } = parseImportRecords(files)
  return records.reduce((depMap, record) => {
    if (!depMap[record.source]) depMap[record.source] = []
    depMap[record.source].push(record.specifier)
    return depMap
  }, {})
}

export function resolveImports(depMap, allFileNames) {
  const files = allFileNames.map((name) => ({ name, content: '' }))
  const records = Object.entries(depMap).flatMap(([source, imports]) =>
    imports.map((specifier) => ({ source, specifier, importType: 'static-import' }))
  )

  return recordsToDepMap(resolveImportRecords(records, files).records)
}

export { getNodeType }

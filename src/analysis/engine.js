import {
  getNodeType,
  parseImportRecords,
  recordsToDepMap,
  resolveImportRecords,
} from '../utils/importParser.js'
import { detectCycles, isCyclicEdge } from '../utils/cycleDetector.js'

const SOURCE_EXTENSIONS = /\.(jsx?|tsx?)$/
const CONFIG_FILES = /(^|\/)(tsconfig|jsconfig)\.json$/i

function getFileName(file) {
  return file.path || file.fullPath || file.name
}

function normalizeFile(file) {
  return {
    name: getFileName(file),
    content: typeof file.content === 'string' ? file.content : '',
  }
}

function buildNodes(depMap, fileNames) {
  const allFiles = Object.keys(depMap)
  const allReferenced = new Set(allFiles)

  Object.values(depMap).flat().forEach((target) => {
    allReferenced.add(target)
  })

  return [...allReferenced].sort().map((filename) => {
    const isGhost = !fileNames.includes(filename)

    return {
      id: filename,
      type: getNodeType(filename),
      isGhost,
      imports: depMap[filename] || [],
      importedBy: allFiles.filter((source) => depMap[source]?.includes(filename)),
    }
  })
}

function buildEdges(depMap, cyclicEdges, importRecords) {
  const edgeTypes = importRecords.reduce((types, record) => {
    types.set(`${record.source}__${record.target}`, record.edgeType)
    return types
  }, new Map())

  return Object.entries(depMap).flatMap(([source, targets]) =>
    targets.map((target) => {
      const cyclic = isCyclicEdge(cyclicEdges, source, target)
      const edgeType = edgeTypes.get(`${source}__${target}`) || 'static-import'

      return {
        id: `${source}__${target}`,
        source,
        target,
        type: edgeType,
        importType: edgeType,
        cyclic,
        data: {
          cyclic,
          importType: edgeType,
        },
      }
    })
  )
}

function buildUnresolvedImports(importRecords) {
  return importRecords
    .filter((record) => !record.resolved)
    .map((record) => ({
      source: record.source,
      importPath: record.specifier,
      importType: record.importType,
      resolvedAs: record.target,
    }))
}

function countUniqueCycles(cyclicEdges) {
  return cyclicEdges.length > 0 ? cyclicEdges.length / 2 : 0
}

export function analyzeProject(files, options = {}) {
  const analysisErrors = [...(options.initialAnalysisErrors || [])]
  const sourceFiles = files
    .map((file, index) => {
      const name = getFileName(file)

      if (!name || typeof name !== 'string') {
        analysisErrors.push({
          code: 'INVALID_FILE_NAME',
          message: 'File is missing a valid name or path.',
          index,
        })
        return null
      }

      if (!SOURCE_EXTENSIONS.test(name) && !CONFIG_FILES.test(name)) {
        return null
      }

      if (typeof file.content !== 'string') {
        analysisErrors.push({
          code: 'INVALID_FILE_CONTENT',
          message: 'File content must be a string.',
          file: name,
        })
        return null
      }

      return normalizeFile(file)
    })
    .filter(Boolean)

  const graphFiles = sourceFiles.filter((file) => SOURCE_EXTENSIONS.test(file.name))
  const fileNames = graphFiles.map((file) => file.name)
  const parsed = parseImportRecords(graphFiles)
  analysisErrors.push(...parsed.analysisErrors)

  const resolved = resolveImportRecords(parsed.records, sourceFiles)
  analysisErrors.push(...resolved.analysisErrors)

  const depMap = {
    ...Object.fromEntries(fileNames.map((fileName) => [fileName, []])),
    ...recordsToDepMap(resolved.records),
  }
  const cyclicEdges = detectCycles(depMap)
  const nodes = buildNodes(depMap, fileNames)
  const edges = buildEdges(depMap, cyclicEdges, resolved.records)
  const unresolvedImports = buildUnresolvedImports(resolved.records)

  return {
    nodes,
    edges,
    depMap,
    cyclicEdges,
    stats: {
      totalFiles: graphFiles.length,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      totalComponents: nodes.filter((node) => node.type === 'component').length,
      totalHooks: nodes.filter((node) => node.type === 'hook').length,
      totalPages: nodes.filter((node) => node.type === 'page').length,
      totalContexts: nodes.filter((node) => node.type === 'context').length,
      totalStyles: nodes.filter((node) => node.type === 'style').length,
      totalConfigs: files.filter((file) => CONFIG_FILES.test(getFileName(file))).length,
      totalRoutes: nodes.filter((node) => node.type === 'page' || node.type === 'index').length,
      cyclesFound: countUniqueCycles(cyclicEdges),
      unresolvedImports: unresolvedImports.length,
      analysisErrors: analysisErrors.length,
    },
    unresolvedImports,
    analysisErrors,
  }
}

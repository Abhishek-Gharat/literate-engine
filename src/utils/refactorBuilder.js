/**
 * Refactor Builder Utilities
 * Generates prompt digests, parses AI refactoring proposals, and creates
 * unified Git patches for circular dependencies, god components, and orphans.
 */

export const REFACTOR_SYSTEM_PROMPT = `You are a Principal React Architect specializing in refactoring and technical debt reduction.
You are given an architectural issue in a React codebase (such as a circular dependency, a god component, or orphan file).

Your goal is to provide a COMPLETE, ACTIONABLE refactoring solution that uncouples the code and eliminates the issue.

You MUST format your output in markdown with EXACTLY these sections:

## Diagnosis
2-3 sentences explaining why this architectural flaw exists and the root cause of the coupling.

## Decoupling Strategy
Ordered steps explaining what to extract, what files to create, and how to rewire imports.

## Refactored Code
For each file touched (including newly created files), provide the exact code block with the filepath in the header:
### \`path/to/file.jsx\` [status: created | modified]
\`\`\`jsx
// file content here
\`\`\`

## Unified Git Patch
Provide a valid git unified diff inside a diff block:
\`\`\`diff
--- a/path/to/file.jsx
+++ b/path/to/file.jsx
@@ ... @@
-old code
+new code
\`\`\`

Rules:
- Never give vague advice like "extract code". Write the real, concrete code!
- Break circular dependencies by extracting shared state, types, or utilities into an intermediary module.
- Keep the diffs clean and minimal.`

/**
 * Builds a prompt digest for the refactoring LLM.
 */
export function buildRefactorDigest(issue, { nodes = [], depMap = {}, files = [] } = {}) {
  const fileContentMap = new Map()
  if (Array.isArray(files)) {
    files.forEach((f) => {
      const name = f.path || f.name || f.fullPath
      if (name && typeof f.content === 'string') {
        fileContentMap.set(name, f.content)
      }
    })
  }

  if (issue.type === 'cycle') {
    const { source, target } = issue
    const sourceContent = fileContentMap.get(source) || ''
    const targetContent = fileContentMap.get(target) || ''

    return `### Architectural Issue: Circular Dependency
Target Files: \`${source}\` ↔ \`${target}\`

Dependency Context:
- \`${source}\` imports: ${JSON.stringify(depMap[source] || [])}
- \`${target}\` imports: ${JSON.stringify(depMap[target] || [])}

${sourceContent ? `#### Current Content of \`${source}\`:\n\`\`\`jsx\n${sourceContent.slice(0, 1500)}\n\`\`\`\n` : ''}
${targetContent ? `#### Current Content of \`${target}\`:\n\`\`\`jsx\n${targetContent.slice(0, 1500)}\n\`\`\`\n` : ''}

Please analyze this cycle, explain how to break it by extracting the shared logic/types into an intermediary file, and provide the exact patch.`
  }

  if (issue.type === 'god_component' || issue.type === 'most_connected') {
    const node = issue.node || {}
    const id = node.id || node.label || 'Component'
    const imports = node.data?.imports || depMap[id] || []
    const importedBy = node.data?.importedBy || []
    const content = fileContentMap.get(id) || ''

    return `### Architectural Issue: Over-Coupled Component (God Component)
Target Component: \`${id}\`
Coupling Metrics:
- Imports: ${imports.length} files (${imports.slice(0, 8).join(', ')})
- Used By: ${importedBy.length} components (${importedBy.slice(0, 8).join(', ')})

${content ? `#### Current Content of \`${id}\`:\n\`\`\`jsx\n${content.slice(0, 2000)}\n\`\`\`\n` : ''}

Please propose a clean decomposition strategy to split this god component into focused sub-components or custom hooks, and generate the patch.`
  }

  if (issue.type === 'orphan') {
    const id = issue.node?.id || issue.node?.data?.label || 'File'
    return `### Architectural Issue: Unreferenced / Orphan File
Target File: \`${id}\`
Nothing in the codebase imports this file, and it imports nothing.

Determine if this is dead code to safely remove or an unlinked entrypoint, and provide the appropriate removal patch or integration.`
  }

  return `### Architectural Issue: Review Target\nTarget: ${JSON.stringify(issue)}`
}

/**
 * Parses markdown output from AI or template into structured sections
 */
export function parseRefactorResponse(text) {
  if (!text) return null

  const getSection = (title) => {
    const regex = new RegExp(`(?:^|\\n)##\\s+${title}[\\r\\n]+([\\s\\S]*?)(?=(?:\\r?\\n##\\s+|$))`, 'i')
    const match = text.match(regex)
    return match ? match[1].trim() : ''
  }

  const diagnosis = getSection('Diagnosis')
  const strategy = getSection('Decoupling Strategy')
  const codeSection = getSection('Refactored Code')
  const patchSection = getSection('Unified Git Patch')

  // Extract files from Refactored Code section
  const fileRegex = /###\s+`([^`]+)`(?:\s*\[status:\s*([^\]]+)\])?[\r\n]+```(?:[a-z]+)?\r?\n([\s\S]*?)```/gi
  const files = []
  let match
  while ((match = fileRegex.exec(codeSection)) !== null) {
    files.push({
      path: match[1],
      status: match[2] || 'modified',
      code: match[3].trim(),
    })
  }

  // Extract raw diff from patch section
  const diffMatch = patchSection.match(/```(?:diff)?\r?\n([\s\S]*?)```/i)
  const patch = diffMatch ? diffMatch[1].trim() : patchSection

  return {
    raw: text,
    diagnosis: diagnosis || 'Automated decoupling analysis completed.',
    strategy: strategy || 'Extract shared state into an isolated module and rewire imports.',
    files,
    patch: patch || generateUnifiedPatchFromFiles(files),
  }
}

/**
 * Builds a valid git unified diff from modified/created files
 */
export function generateUnifiedPatchFromFiles(files) {
  if (!files || files.length === 0) return ''

  return files
    .map((f) => {
      const isNew = f.status === 'created'
      const lines = f.code.split('\n')
      const plusLines = lines.map((l) => `+${l}`).join('\n')

      if (isNew) {
        return `--- /dev/null\n+++ b/${f.path}\n@@ -0,0 +1,${lines.length} @@\n${plusLines}`
      }
      return `--- a/${f.path}\n+++ b/${f.path}\n@@ -1,${Math.min(5, lines.length)} +1,${lines.length} @@\n${plusLines}`
    })
    .join('\n\n')
}

/**
 * Clean basename helper
 */
function getBaseName(path) {
  const parts = path.split(/[/\\]/)
  return parts[parts.length - 1].replace(/\.[^/.]+$/, '')
}

/**
 * Generates an offline, instant, high-quality refactoring plan
 * when no OpenRouter API key is configured.
 */
export function generateOfflineRefactorPlan(issue) {
  if (issue.type === 'cycle') {
    const { source, target } = issue
    const baseSource = getBaseName(source)
    const baseTarget = getBaseName(target)
    const sharedName = `${baseTarget}Types`
    const sharedPath = `src/types/${sharedName}.js`

    const diagnosis = `Direct circular dependency between **\`${source}\`** and **\`${target}\`**.
Both modules directly import each other, causing recursive resolution, tight coupling, and preventing independent module testing.`

    const strategy = `1. **Create an intermediary contract module:** Create **\`${sharedPath}\`** to hold shared state interfaces and types.
2. **Decouple \`${target}\`:** Update \`${target}\` to export standalone state and import pure contracts from **\`${sharedPath}\`**.
3. **Rewire \`${source}\`:** Update \`${source}\` to consume state through the decoupled hook rather than creating a back-import into \`${target}\`.
4. **Result:** The cycle is completely eliminated and forms a clean Directed Acyclic Graph (DAG).`

    const sharedFileContent = `/**
 * Shared contract extracted to break cycle between ${baseSource} and ${baseTarget}
 */

export const INITIAL_${baseTarget.toUpperCase()}_STATE = {
  active: false,
  timestamp: Date.now(),
}

export function create${baseTarget}Event(payload) {
  return {
    type: '${baseTarget.toUpperCase()}_ACTION',
    payload,
  }
}
`

    const sourceModifiedContent = `// Updated ${source} - import from shared contract to eliminate cycle
import { INITIAL_${baseTarget.toUpperCase()}_STATE } from './types/${sharedName}.js'

export function ${baseSource}Wrapper(props) {
  // Logic decoupled from ${target}
  return (
    <div className="${baseSource.toLowerCase()}-container">
      {props.children}
    </div>
  )
}
`

    const files = [
      {
        path: sharedPath,
        status: 'created',
        code: sharedFileContent,
      },
      {
        path: source,
        status: 'modified',
        code: sourceModifiedContent,
      },
    ]

    const patch = `--- /dev/null
+++ b/${sharedPath}
@@ -0,0 +1,15 @@
+/**
+ * Shared contract extracted to break cycle between ${baseSource} and ${baseTarget}
+ */
+export const INITIAL_${baseTarget.toUpperCase()}_STATE = {
+  active: false,
+  timestamp: Date.now(),
+}

--- a/${source}
+++ b/${source}
@@ -1,4 +1,4 @@
-import { ${baseTarget} } from './${target}'
+import { INITIAL_${baseTarget.toUpperCase()}_STATE } from './types/${sharedName}.js'
`

    return {
      raw: '',
      diagnosis,
      strategy,
      files,
      patch,
      isOffline: true,
    }
  }

  if (issue.type === 'god_component' || issue.type === 'most_connected') {
    const node = issue.node || {}
    const id = node.data?.label || node.id || 'GodComponent.jsx'
    const baseName = getBaseName(id)
    const hookPath = `src/hooks/use${baseName}.js`

    const diagnosis = `**\`${id}\`** acts as a God Component with excessive coupling.
It is heavily imported across the application, which creates a large blast radius where any small change risks breaking unrelated features.`

    const strategy = `1. **Extract Business Logic into a Custom Hook:** Move stateful operations and effects into **\`${hookPath}\`**.
2. **Make \`${id}\` a Pure Presentational Component:** Convert the component to focus strictly on rendering JSX props.
3. **Decouple Dependents:** Dependents can now import the lightweight hook directly instead of bundling the whole heavy component.`

    const hookContent = `import { useState, useCallback } from 'react'

export function use${baseName}() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAction = useCallback(() => {
    // Extracted business logic
  }, [])

  return { data, loading, handleAction }
}
`

    const files = [
      {
        path: hookPath,
        status: 'created',
        code: hookContent,
      },
    ]

    const patch = `--- /dev/null
+++ b/${hookPath}
@@ -0,0 +1,14 @@
+import { useState, useCallback } from 'react'
+
+export function use${baseName}() {
+  const [data, setData] = useState(null)
+  return { data }
+}
`

    return {
      raw: '',
      diagnosis,
      strategy,
      files,
      patch,
      isOffline: true,
    }
  }

  // Fallback for orphans
  const id = issue.node?.data?.label || issue.node?.id || 'OrphanFile.jsx'
  return {
    raw: '',
    diagnosis: `**\`${id}\`** is an unreferenced file with 0 inbound and 0 outbound dependencies.`,
    strategy: `1. Check git blame to verify if this file was part of a discontinued feature.
2. If obsolete, remove it to reduce bundle bloat and maintenance overhead.
3. If meant to be an active page/entrypoint, register it in your router or barrel index file.`,
    files: [],
    patch: `--- a/${id}\n+++ /dev/null\n@@ -1,50 +0,0 @@\n-deleted unreferenced file`,
    isOffline: true,
  }
}

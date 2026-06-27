import { useState, useCallback } from 'react'

const SOURCE_EXTENSIONS = /\.(jsx?|tsx?)$/

/**
 * useUpload - Hook for managing file uploads and GitHub analysis
 * 
 * @param {Object} options
 * @param {Function} options.onFilesReady - Callback when files are ready
 * @param {Function} options.onSuccess - Callback on successful analysis
 * @returns {Object} Upload state and handlers
 */
export function useUpload({ onFilesReady, onSuccess } = {}) {
  const [mode, setMode] = useState('local')
  const [githubUrl, setGithubUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileCount, setFileCount] = useState(0)
  const [lastAnalyzedFiles, setLastAnalyzedFiles] = useState(null)

  const handleLocalFiles = useCallback(async (fileList, selectedProject) => {
    if (!selectedProject) {
      throw new Error('Please select a project before analyzing files')
    }

    const files = Array.from(fileList).filter(f => SOURCE_EXTENSIONS.test(f.name))
    if (files.length === 0) {
      throw new Error('No .js / .jsx / .ts / .tsx files selected')
    }

    const emptyFiles = files.filter(f => f.size === 0)
    if (emptyFiles.length > 0) {
      throw new Error(`${emptyFiles.length} file(s) are empty and will be skipped`)
    }

    const validFiles = files.filter(f => f.size > 0)
    if (validFiles.length === 0) {
      throw new Error('All selected files are empty')
    }

    setLoading(true)
    try {
      const fileData = await Promise.all(
        validFiles.map(f => f.text().then(content => ({ name: f.name, content })))
      )

      setFileCount(fileData.length)
      setLastAnalyzedFiles(fileData)
      await onFilesReady(fileData, selectedProject.id)
      if (onSuccess) onSuccess()
      return fileData.length
    } finally {
      setLoading(false)
    }
  }, [onFilesReady, onSuccess])

  const handleGithubFetch = useCallback(async (url, selectedProject) => {
    if (!selectedProject) {
      throw new Error('Please select a project before analyzing')
    }
    if (!url.trim()) {
      throw new Error('Please enter a GitHub repository URL')
    }

    setLoading(true)
    try {
      const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/)
      if (!match) {
        throw new Error('Invalid GitHub URL format. Use: https://github.com/owner/repo')
      }

      const [, owner, repo] = match

      // First, get the default branch
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
      if (repoRes.status === 403 || repoRes.status === 429) {
        const body = await repoRes.json().catch(() => ({}))
        throw new Error(body.message || 'GitHub API rate limit reached. Try again later.')
      }
      if (repoRes.status === 404) throw new Error('Repository not found')
      const repoData = await repoRes.json()
      const branch = repoData.default_branch

      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
      )
      if (treeRes.status === 403 || treeRes.status === 429) {
        const body = await treeRes.json().catch(() => ({}))
        throw new Error(body.message || 'GitHub API rate limit reached. Try again later.')
      }
      if (treeRes.status === 404) throw new Error('Repository not found')
      if (treeRes.status === 422) throw new Error('Repository is empty')
      if (!treeRes.ok) {
        const body = await treeRes.json().catch(() => ({}))
        throw new Error(body.message || 'Repository not found or is private')
      }

      const treeData = await treeRes.json()
      const jsFiles = treeData.tree.filter(f =>
        SOURCE_EXTENSIONS.test(f.path) &&
        !f.path.includes('node_modules') &&
        !f.path.includes('dist') &&
        !f.path.includes('.min.')
      )

      if (jsFiles.length === 0) {
        throw new Error('No JS/JSX files found in this repository')
      }

      // Try raw.githubusercontent.com first (no rate limit), fallback to Contents API
      const fileResults = await Promise.allSettled(
        jsFiles.slice(0, 80).map(async (f) => {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${f.path}`
          const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${f.path}?ref=${branch}`

          // Try raw first (no rate limit)
          const rawRes = await fetch(rawUrl)
          if (rawRes.ok) {
            const content = await rawRes.text()
            const name = f.path.split('/').pop()
            return { name, content, fullPath: f.path }
          }

          // Fallback to Contents API (has rate limit)
          const apiRes = await fetch(apiUrl, {
            headers: { Accept: 'application/vnd.github.v3+json' },
          })
          if (!apiRes.ok) throw new Error(`HTTP ${apiRes.status}`)
          const json = await apiRes.json()
          const content = atob(json.content.replace(/\s/g, ''))
          const name = f.path.split('/').pop()
          return { name, content, fullPath: f.path }
        })
      )
      const fileData = fileResults
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
      const failedCount = fileResults.filter(r => r.status === 'rejected').length
      if (fileData.length === 0) throw new Error('Failed to fetch any files from the repository')
      if (failedCount > 0) console.warn(`Skipped ${failedCount} files that could not be fetched`)

      setFileCount(fileData.length)
      setLastAnalyzedFiles(fileData)
      await onFilesReady(fileData, selectedProject.id)
      if (onSuccess) onSuccess()
      return fileData.length
    } finally {
      setLoading(false)
    }
  }, [onFilesReady, onSuccess])

  const handleReanalyze = useCallback(async (selectedProject) => {
    if (!selectedProject) {
      throw new Error('Please select a project before re-analyzing')
    }
    if (!lastAnalyzedFiles || lastAnalyzedFiles.length === 0) {
      throw new Error('No previous analysis found. Please upload files or analyze from GitHub first.')
    }

    setLoading(true)
    try {
      await onFilesReady(lastAnalyzedFiles, selectedProject.id)
      if (onSuccess) onSuccess()
      return lastAnalyzedFiles.length
    } finally {
      setLoading(false)
    }
  }, [lastAnalyzedFiles, onFilesReady, onSuccess])

  return {
    mode,
    setMode,
    githubUrl,
    setGithubUrl,
    loading,
    error,
    setError,
    fileCount,
    lastAnalyzedFiles,
    handleLocalFiles,
    handleGithubFetch,
    handleReanalyze,
  }
}

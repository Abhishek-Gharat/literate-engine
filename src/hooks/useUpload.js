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
      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
      if (!match) {
        throw new Error('Invalid GitHub URL format. Use: https://github.com/owner/repo')
      }

      const [, owner, repo] = match

      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`
      )
      if (!treeRes.ok) throw new Error('Repository not found or is private')

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

      const fileData = await Promise.all(
        jsFiles.slice(0, 80).map(async (f) => {
          const res = await fetch(
            `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${f.path}`
          )
          if (!res.ok) throw new Error(`Failed to fetch file: ${f.path}`)
          const content = await res.text()
          const name = f.path.split('/').pop()
          return { name, content, fullPath: f.path }
        })
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

import { useState } from 'react'

const TOAST_TIMEOUT = 5000

/**
 * useCreateProject - Hook for managing project creation modal
 * 
 * @param {Object} options
 * @param {Function} options.onCreateProject - Callback to create project
 * @param {Function} options.onSuccess - Callback on successful creation
 * @returns {Object} Modal state and handlers
 */
export function useCreateProject({ onCreateProject, onSuccess } = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const open = () => {
    setIsOpen(true)
    setError('')
    setSuccess('')
  }

  const close = () => {
    if (!isCreating) {
      setIsOpen(false)
      setName('')
      setDescription('')
      setError('')
      setSuccess('')
    }
  }

  const create = async () => {
    if (!name.trim()) {
      setError('Project name is required')
      return
    }
    if (name.trim().length > 255) {
      setError('Project name must be 255 characters or fewer')
      return
    }
    if (description.trim().length > 500) {
      setError('Description must be 500 characters or fewer')
      return
    }

    setError('')
    setIsCreating(true)

    try {
      await onCreateProject(name.trim(), description.trim())
      setSuccess(`Project "${name.trim()}" created successfully`)
      setTimeout(() => {
        setIsOpen(false)
        setName('')
        setDescription('')
        setSuccess('')
        if (onSuccess) onSuccess()
      }, TOAST_TIMEOUT)
    } catch (err) {
      setError(err.message || 'Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

  return {
    isOpen,
    name,
    description,
    error,
    success,
    isCreating,
    setName,
    setDescription,
    open,
    close,
    create,
  }
}

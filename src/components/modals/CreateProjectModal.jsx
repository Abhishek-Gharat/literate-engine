import React from 'react'

/**
 * CreateProjectModal - Modal dialog for creating new projects
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {string} props.name - Project name value
 * @param {string} props.description - Project description value
 * @param {string} props.error - Error message to display
 * @param {string} props.success - Success message to display
 * @param {boolean} props.isCreating - Whether creation is in progress
 * @param {Function} props.onNameChange - Callback when name changes
 * @param {Function} props.onDescriptionChange - Callback when description changes
 * @param {Function} props.onClose - Callback to close modal
 * @param {Function} props.onSubmit - Callback to submit form
 */
export default function CreateProjectModal({
  isOpen,
  name,
  description,
  error,
  success,
  isCreating,
  onNameChange,
  onDescriptionChange,
  onClose,
  onSubmit
}) {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        background: '#0d0d14',
        border: '1px solid #1e1e2e',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>
          Create New Project
        </h3>

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#64748b',
            marginBottom: '4px'
          }}>
            Project Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            disabled={isCreating}
            placeholder="My React App"
            maxLength={255}
            data-testid="project-name-input"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #1e1e2e',
              background: '#13131f',
              color: '#f1f5f9',
              fontSize: '14px',
              boxSizing: 'border-box',
              outline: 'none',
              opacity: isCreating ? 0.5 : 1
            }}
          />
          <div style={{
            fontSize: '11px',
            color: name.length > 200 ? '#fbbf24' : '#64748b',
            marginTop: '4px',
            textAlign: 'right'
          }}>
            {name.length}/255
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#64748b',
            marginBottom: '4px'
          }}>
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            disabled={isCreating}
            placeholder="A brief description..."
            rows={2}
            maxLength={500}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #1e1e2e',
              background: '#13131f',
              color: '#f1f5f9',
              fontSize: '14px',
              boxSizing: 'border-box',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              opacity: isCreating ? 0.5 : 1
            }}
          />
          <div style={{
            fontSize: '11px',
            color: description.length > 450 ? '#fbbf24' : '#64748b',
            marginTop: '4px',
            textAlign: 'right'
          }}>
            {description.length}/500
          </div>
        </div>

        {error && (
          <div style={{
            color: '#ef4444',
            fontSize: '13px',
            marginBottom: '12px',
            padding: '8px',
            background: '#ef444415',
            borderRadius: '6px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            color: '#22c55e',
            fontSize: '13px',
            marginBottom: '12px',
            padding: '8px',
            background: '#22c55e15',
            borderRadius: '6px'
          }}>
            ✓ {success}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onClose}
            disabled={isCreating}
            style={{
              flex: 1,
              padding: '10px',
              background: 'transparent',
              border: '1px solid #1e1e2e',
              borderRadius: '6px',
              color: isCreating ? '#334155' : '#94a3b8',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isCreating || !name.trim()}
            data-testid="create-project-submit"
            style={{
              flex: 1,
              padding: '10px',
              background: (isCreating || !name.trim()) ? '#334155' : '#7c3aed',
              border: 'none',
              borderRadius: '6px',
              color: (isCreating || !name.trim()) ? '#64748b' : '#fff',
              cursor: (isCreating || !name.trim()) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

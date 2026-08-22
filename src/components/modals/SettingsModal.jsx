import React, { useState } from 'react'
import ApiKeyInput from '../inspector/ApiKeyInput'
import { useApiKey } from '../../hooks/useApiKey'

const REPO_URL = 'https://github.com/Abhishek-Gharat/literate-engine'
const LOCAL_PROJECTS_KEY = 'reactviz_local_projects'

/**
 * SettingsModal - Application settings: OpenRouter API key, local data
 * management, and about info.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 */
export default function SettingsModal({ isOpen, onClose }) {
  const { apiKey, handleApiKeyChange } = useApiKey()
  const [cleared, setCleared] = useState(false)

  if (!isOpen) return null

  const clearLocalProjects = () => {
    localStorage.removeItem(LOCAL_PROJECTS_KEY)
    setCleared(true)
    setTimeout(() => setCleared(false), 2000)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="settings-modal"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        padding: '20px 24px',
        width: '100%',
        maxWidth: '440px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#ffffff' }}>Settings</h3>
          <button
            onClick={onClose}
            data-testid="settings-modal-close"
            style={{
              width: '28px', height: '28px',
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '7px',
              color: '#ededed', cursor: 'pointer', fontSize: '14px', lineHeight: 1
            }}
          >×</button>
        </div>

        <section style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '11px', fontWeight: '700', color: '#a1a1a1',
            textTransform: 'uppercase', letterSpacing: '1.4px',
            marginBottom: '10px'
          }}>AI · OpenRouter API Key</div>
          <ApiKeyInput
            apiKey={apiKey}
            showKey={true}
            onKeyChange={handleApiKeyChange}
            onShowKeyToggle={() => {}}
          />
          <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#71717a', lineHeight: '1.5' }}>
            Free keys at openrouter.ai — powers the AI chat and architecture reviews.
          </p>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '11px', fontWeight: '700', color: '#a1a1a1',
            textTransform: 'uppercase', letterSpacing: '1.4px',
            marginBottom: '10px'
          }}>Data</div>
          <button
            onClick={clearLocalProjects}
            data-testid="clear-local-projects"
            style={{
              padding: '8px 14px',
              background: cleared ? '#22c55e15' : '#111111',
              border: `1px solid ${cleared ? '#22c55e55' : 'rgba(239,68,68,0.35)'}`,
              borderRadius: '6px',
              color: cleared ? '#4ade80' : '#fca5a5',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >{cleared ? '✓ Local cache cleared' : 'Clear locally cached projects'}</button>
        </section>

        <section>
          <div style={{
            fontSize: '11px', fontWeight: '700', color: '#a1a1a1',
            textTransform: 'uppercase', letterSpacing: '1.4px',
            marginBottom: '10px'
          }}>About</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
            ReactViz v1.0.4 · Analysis Engine<br />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              data-testid="settings-repo-link"
              style={{ color: '#e2e2e2' }}
            >GitHub repository ↗</a>
          </div>
        </section>
      </div>
    </div>
  )
}

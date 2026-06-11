import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'reactviz_api_key'

/**
 * useApiKey - Hook for managing OpenRouter API key with localStorage persistence
 * 
 * @returns {Object} API key state and handlers
 * @property {string} apiKey - Current API key value
 * @property {boolean} showKeyInput - Whether API key input is visible
 * @property {function} setApiKey - Direct setter for API key
 * @property {function} handleApiKeyChange - Handler that updates state and persists to localStorage
 * @property {function} toggleKeyInput - Toggle visibility of API key input
 * @property {function} showKeyInputPanel - Show API key input panel
 * @property {function} hideKeyInputPanel - Hide API key input panel
 */
export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(() => {
    // Initialize synchronously for SSR compatibility
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || ''
    }
    return ''
  })
  
  const [showKeyInput, setShowKeyInput] = useState(false)

  const handleApiKeyChange = useCallback((value) => {
    setApiKeyState(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, value)
    }
  }, [])

  const toggleKeyInput = useCallback(() => {
    setShowKeyInput(prev => !prev)
  }, [])

  const showKeyInputPanel = useCallback(() => {
    setShowKeyInput(true)
  }, [])

  const hideKeyInputPanel = useCallback(() => {
    setShowKeyInput(false)
  }, [])

  return {
    apiKey,
    showKeyInput,
    setApiKey: setApiKeyState,
    handleApiKeyChange,
    toggleKeyInput,
    showKeyInputPanel,
    hideKeyInputPanel,
  }
}

import { useState, useCallback } from 'react'
import {
  REFACTOR_SYSTEM_PROMPT,
  buildRefactorDigest,
  parseRefactorResponse,
  generateOfflineRefactorPlan,
} from '../utils/refactorBuilder.js'

const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-4-scout:free',
  'meta-llama/llama-4-maverick:free',
  'openrouter/free',
]

/**
 * useRefactorPlan - Generates actionable architectural decoupling plans,
 * complete code refactors, and Git unified patches.
 */
export function useRefactorPlan() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generatePlan = useCallback(async (issue, apiKey, context = {}) => {
    setError('')
    setPlan(null)
    setLoading(true)

    // If no API key is provided, use offline rule-based synthesis
    if (!apiKey) {
      // Simulate brief thinking delay for realistic UX
      await new Promise((res) => setTimeout(res, 400))
      const offlinePlan = generateOfflineRefactorPlan(issue, context)
      setPlan(offlinePlan)
      setLoading(false)
      return
    }

    const digest = buildRefactorDigest(issue, context)
    let success = false

    for (const model of FREE_MODELS) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://reactviz.app',
            'X-Title': 'ReactViz Refactor Engine',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: REFACTOR_SYSTEM_PROMPT },
              { role: 'user', content: digest },
            ],
            max_tokens: 2200,
            stream: false,
          }),
        })

        if (!res.ok) continue

        const data = await res.json()
        const reply = data?.choices?.[0]?.message?.content
        if (!reply) continue

        const parsed = parseRefactorResponse(reply)
        if (parsed) {
          setPlan(parsed)
          success = true
          break
        }
      } catch {
        continue
      }
    }

    if (!success) {
      // Fallback gracefully to offline synthesis if model request fails
      const fallbackPlan = generateOfflineRefactorPlan(issue, context)
      fallbackPlan.offlineNotice = 'Live AI model was unavailable; generated via local AST rule engine.'
      setPlan(fallbackPlan)
    }

    setLoading(false)
  }, [])

  const resetPlan = useCallback(() => {
    setPlan(null)
    setError('')
    setLoading(false)
  }, [])

  return {
    plan,
    loading,
    error,
    generatePlan,
    resetPlan,
  }
}

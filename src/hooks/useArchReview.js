import { useState, useCallback } from 'react'
import { REVIEW_SYSTEM_PROMPT } from '../utils/reviewBuilder.js'

// Same confirmed-working free models as the chat integration
const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-4-scout:free',
  'meta-llama/llama-4-maverick:free',
  'openrouter/free',
]

/**
 * useArchReview - Generates a one-click AI architecture review report
 * from a project digest via the OpenRouter integration.
 */
export function useArchReview() {
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateReview = useCallback(async (apiKey, digest) => {
    if (!apiKey) {
      setError('API key required — add your OpenRouter key first')
      return
    }

    setError('')
    setReport('')
    setLoading(true)

    let success = false

    for (const model of FREE_MODELS) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://reactviz.app',
            'X-Title': 'ReactViz'
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: REVIEW_SYSTEM_PROMPT },
              { role: 'user', content: digest }
            ],
            max_tokens: 1600,
            stream: false
          })
        })

        if (res.status === 429 || res.status === 404 || res.status === 400) {
          continue
        }

        if (!res.ok) continue

        const data = await res.json()
        const reply = data?.choices?.[0]?.message?.content
        if (!reply) continue

        setReport(reply)
        success = true
        break
      } catch {
        continue
      }
    }

    if (!success) {
      setError('No free model was available — try again shortly or use a paid key')
    }

    setLoading(false)
  }, [])

  const resetReview = useCallback(() => {
    setReport('')
    setError('')
    setLoading(false)
  }, [])

  return { report, loading, error, generateReview, resetReview }
}

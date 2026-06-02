import { useState, useCallback } from 'react'

const SYSTEM_PROMPT = `You are a friendly React mentor helping developers understand their codebase.
You explain things like a senior developer talking to a junior — casual, clear, no unnecessary jargon.

Rules:
- Be conversational, not robotic
- Use simple analogies when helpful
- Reference file names naturally like "Navbar.jsx is basically your top bar"
- For follow-up questions, remember previous context
- Max 4-5 lines unless user asks for more detail
- If you spot issues like circular deps or too many imports, mention it casually
- Never start with "Based on the structure" — just explain naturally
- Use **bold** for important terms and \`backticks\` for file names`

// Confirmed working free models March 2026
const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-4-scout:free',
  'meta-llama/llama-4-maverick:free',
  'openrouter/free',
]

export function useAIExplain() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const buildContext = (nodeData, depMap, stats) => {
    if (nodeData) {
      return `Currently looking at: ${nodeData.label}
Type: ${nodeData.nodeType}
Imports: ${nodeData.imports?.length > 0 ? nodeData.imports.join(', ') : 'none'}
Used by: ${nodeData.importedBy?.length > 0 ? nodeData.importedBy.join(', ') : 'nothing — leaf or top-level file'}`
    }
    if (depMap && stats) {
      return `Full project structure:
${Object.entries(depMap).map(([f, imps]) => `${f} → [${imps.join(', ') || 'no imports'}]`).join('\n')}
Stats: ${stats.totalFiles} files, ${stats.totalComponents} components, ${stats.totalHooks} hooks, ${stats.cyclesFound} circular deps`
    }
    return ''
  }

  const sendMessage = useCallback(async (userText, apiKey, nodeData, depMap, stats) => {
    if (!apiKey) { setError('API key required — ⚙ mein add karo'); return }
    if (!userText.trim()) return

    setError('')

    const userMsg = { role: 'user', content: userText, id: Date.now() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setLoading(true)

    const context = buildContext(nodeData, depMap, stats)
    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\nCurrent codebase context:\n${context}`
      : SYSTEM_PROMPT

    const apiMessages = [
      { role: 'system', content: systemWithContext },
      ...updatedMessages.slice(-8).map(m => ({
        role: m.role,
        content: m.content
      }))
    ]

    const aiMsgId = Date.now() + 1

    // Add placeholder AI message
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      id: aiMsgId,
      streaming: true
    }])

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
            messages: apiMessages,
            max_tokens: 800,
            stream: false // non-streaming — most reliable
          })
        })

        if (res.status === 429 || res.status === 404 || res.status === 400) {
          continue // try next model
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          const msg = errData?.error?.message || `Model ${model} failed (${res.status})`
          // skip to next model
          continue
        }

        const data = await res.json()
        const reply = data?.choices?.[0]?.message?.content

        if (!reply) continue

        // Update message with response
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId
            ? { ...m, content: reply, streaming: false }
            : m
        ))

        success = true
        break // done

      } catch (err) {
        continue // network error — try next model
      }
    }

    if (!success) {
      setError('Koi bhi free model available nahi hai abhi — thodi der baad try karo ya paid key use karo')
      setMessages(prev => prev.filter(m => m.id !== aiMsgId))
    }

    setLoading(false)

  }, [messages])

  const clearChat = useCallback(() => {
    setMessages([])
    setError('')
  }, [])

  return { messages, loading, error, sendMessage, clearChat }
}
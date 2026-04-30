export async function sendChat({ messages, systemPrompt, apiKey, model = 'gpt-4o' }) {
  if (!apiKey) throw new Error('No API key configured. Open Settings to add your OpenAI key.')

  const body = {
    model,
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...messages
    ]
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `OpenAI error ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

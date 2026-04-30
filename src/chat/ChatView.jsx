import { useRef, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, addMessage, clearMessages } from '../db'
import { useStore } from '../store'
import { sendChat } from '../ai'
import { ConfigPanel } from '../spaces/ConfigPanel'
import { IconSend, IconSliders, IconClear } from '../ui/Icons'

export function ChatView() {
  const { activeSpaceId, apiKey, model } = useStore()
  const space = useLiveQuery(() => db.spaces.get(activeSpaceId), [activeSpaceId])
  const messages = useLiveQuery(
    () => db.messages.where('spaceId').equals(activeSpaceId).sortBy('createdAt'),
    [activeSpaceId]
  )
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.length, loading])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    textareaRef.current.style.height = 'auto'
    setLoading(true)
    await addMessage({ spaceId: activeSpaceId, role: 'user', content: text })
    try {
      const history = (messages || []).map(m => ({ role: m.role, content: m.content }))
      const systemPrompt = space?.instructions || ''
      const reply = await sendChat({ messages: [...history, { role: 'user', content: text }], systemPrompt, apiKey, model })
      await addMessage({ spaceId: activeSpaceId, role: 'assistant', content: reply })
    } catch (err) {
      await addMessage({ spaceId: activeSpaceId, role: 'assistant', content: `⚠️ Error: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  if (!space) return null

  return (
    <div className="space-view">
      <header className="space-header">
        <span className="space-header-icon" aria-hidden="true">{space.icon}</span>
        <div className="space-header-info">
          <div className="space-header-name">{space.name}</div>
          {space.instructions && <div className="space-header-meta">Custom instructions active</div>}
        </div>
        <div className="space-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setConfigOpen(true)} aria-label="Configure space">
            <IconSliders size={13} />Configure
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => clearMessages(activeSpaceId)} aria-label="Clear chat history" title="Clear history">
            <IconClear size={13} />Clear
          </button>
        </div>
      </header>

      {!apiKey && (
        <div className="api-key-banner">
          ⚠️ No API key set — open Settings to add your OpenAI key before chatting.
        </div>
      )}

      <div className="chat-area" role="log" aria-live="polite" aria-label="Chat messages">
        {!messages?.length && !loading ? (
          <div className="chat-empty">
            <div className="chat-empty-icon" aria-hidden="true">{space.icon}</div>
            <h3>{space.name}</h3>
            <p>{space.instructions ? 'Instructions active. Say something to begin.' : 'Start a conversation in this Space.'}</p>
          </div>
        ) : (
          <>
            {messages?.map(msg => (
              <div key={msg.id} className={`message ${msg.role}`}>
                <span className="message-role">{msg.role === 'user' ? 'You' : 'AI'}</span>
                <div className="message-bubble">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <span className="message-role">AI</span>
                <div className="message-thinking" aria-label="Thinking">
                  <div className="thinking-dot" /><div className="thinking-dot" /><div className="thinking-dot" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-input"
            rows={1}
            value={input}
            onInput={handleInput}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={apiKey ? `Message ${space.name}…` : 'Add an API key in Settings to chat…'}
            disabled={loading || !apiKey}
            aria-label="Chat input"
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim() || loading || !apiKey}
            aria-label="Send message"
          >
            <IconSend size={14} />
          </button>
        </div>
      </div>

      {configOpen && <ConfigPanel space={space} onClose={() => setConfigOpen(false)} />}
    </div>
  )
}

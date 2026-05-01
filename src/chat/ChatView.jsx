import { useState, useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, addMessage, getMessages, clearMessages } from '../db'
import { useStore } from '../store'
import { streamChat } from '../ai/openai'
import { ChatInput } from './ChatInput'
import { ConfigPanel } from '../spaces/ConfigPanel'
import { IconSliders, IconClear, IconKey } from '../ui/Icons'

export function ChatView() {
  const {
    activeSpaceId,
    apiKeys,
    configPanelOpen,
    toggleConfigPanel,
    openSettings,
    streamingContent,
    setStreamingContent,
    clearStreaming,
    messageTick,
    bumpMessageTick,
  } = useStore()

  const space = useLiveQuery(
    () => (activeSpaceId ? db.spaces.get(activeSpaceId) : null),
    [activeSpaceId]
  )

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  const activeProvider = space?.provider || 'openai'
  const activeApiKey = activeProvider === 'ollama'
    ? (apiKeys?.ollamaUrl || 'http://localhost:11434')
    : (apiKeys?.[activeProvider] || '')
  const keyMissing = activeProvider !== 'ollama' && !activeApiKey

  useEffect(() => {
    if (!activeSpaceId) { setMessages([]); return }
    getMessages(activeSpaceId).then(setMessages)
  }, [activeSpaceId, messageTick])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  async function handleSend() {
    if (!input.trim() || sending) return
    if (keyMissing) { setError(`Add your ${activeProvider} API key in Settings first.`); return }

    const userText = input.trim()
    setInput('')
    setError(null)
    setSending(true)

    await addMessage({ spaceId: activeSpaceId, role: 'user', content: userText })
    bumpMessageTick()

    const allMsgs = await getMessages(activeSpaceId)
    const systemPrompt = space?.role
      ? [{ role: 'system', content: space.role }]
      : []

    const chatMessages = [
      ...systemPrompt,
      ...allMsgs.map((m) => ({ role: m.role, content: m.content })),
    ]

    try {
      setStreamingContent('')
      const model = space?.model || 'gpt-4o-mini'
      const full = await streamChat({
        apiKey: activeApiKey,
        model,
        messages: chatMessages,
        onChunk: (text) => setStreamingContent(text),
      })
      clearStreaming()
      await addMessage({ spaceId: activeSpaceId, role: 'assistant', content: full })
      bumpMessageTick()
    } catch (err) {
      clearStreaming()
      setError(err.message || 'Something went wrong.')
    } finally {
      setSending(false)
    }
  }

  async function handleClear() {
    if (!activeSpaceId) return
    if (!window.confirm('Clear all messages in this Space?')) return
    await clearMessages(activeSpaceId)
    bumpMessageTick()
  }

  if (!space) return null

  const modelChip = `${space.provider || 'openai'} / ${space.model || 'gpt-4o-mini'}`

  return (
    <div className="space-view">
      <header className="space-header">
        <span className="space-header-icon" aria-hidden="true">{space.icon}</span>
        <div className="space-header-info">
          <div className="space-header-name">{space.name}</div>
          <div className="space-header-meta">
            {modelChip}
            {space.role ? ' · Custom instructions active' : ''}
          </div>
        </div>
        <div className="space-header-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleClear}
            title="Clear conversation"
            aria-label="Clear conversation"
          >
            <IconClear size={14} />
            Clear
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={toggleConfigPanel}
            aria-label="Configure Space"
            aria-expanded={configPanelOpen}
          >
            <IconSliders size={14} />
            Configure
          </button>
        </div>
      </header>

      {keyMissing && (
        <div className="api-key-banner" role="alert">
          <IconKey size={14} />
          No {activeProvider} API key set —{' '}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: 0, textDecoration: 'underline', fontSize: 'inherit' }}
            onClick={openSettings}
          >
            open Settings
          </button>{' '}
          to add your key, or pick a different provider in Configure.
        </div>
      )}

      <div className="chat-area" role="log" aria-live="polite" aria-label="Conversation">
        {messages.length === 0 && !streamingContent && (
          <div className="chat-empty">
            <div className="chat-empty-icon">{space.icon}</div>
            <h3>{space.name}</h3>
            <p>
              {space.role
                ? 'Custom instructions active. Start a conversation.'
                : 'No instructions set. Configure this Space or just start chatting.'}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}

        {streamingContent !== null && (
          <MessageBubble role="assistant" content={streamingContent} streaming />
        )}

        {sending && streamingContent === null && (
          <div className="message assistant">
            <div className="message-role">Assistant</div>
            <div className="message-thinking" aria-label="Thinking">
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'oklch(from var(--color-error) l c h / 0.08)',
              border: '1px solid oklch(from var(--color-error) l c h / 0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-error)',
              alignSelf: 'flex-start',
              maxWidth: 480,
            }}
          >
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={sending || keyMissing}
      />

      {configPanelOpen && <ConfigPanel />}
    </div>
  )
}

function MessageBubble({ role, content, streaming }) {
  return (
    <div className={`message ${role}`}>
      <div className="message-role">{role === 'user' ? 'You' : 'Assistant'}</div>
      <div className="message-bubble">
        {content}
        {streaming && (
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: 2,
              height: '1em',
              background: 'currentColor',
              marginLeft: 2,
              animation: 'blink 0.8s step-end infinite',
              verticalAlign: 'text-bottom',
            }}
          />
        )}
      </div>
    </div>
  )
}

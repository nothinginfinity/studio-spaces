import { useRef, useEffect } from 'react'
import { IconSend } from '../ui/Icons'

export function ChatInput({ value, onChange, onSend, disabled }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [value])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim()) onSend()
    }
  }

  return (
    <div className="chat-input-area">
      <div className="chat-input-wrapper">
        <textarea
          ref={ref}
          className="chat-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message this Space… (Enter to send, Shift+Enter for newline)"
          rows={1}
          aria-label="Message input"
          disabled={disabled}
        />
        <button
          className="send-btn"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          <IconSend size={14} />
        </button>
      </div>
    </div>
  )
}

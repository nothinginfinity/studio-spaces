import { useState } from 'react'
import { useStore } from '../store'
import { IconClose, IconKey } from '../ui/Icons'

export function Settings() {
  const { apiKey, setApiKey, model, setModel, closeSettings } = useStore()
  const [draft, setDraft] = useState(apiKey)
  const [show, setShow] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setApiKey(draft.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="overlay" onClick={closeSettings} role="dialog" aria-modal="true" aria-label="Settings">
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">Settings</span>
          <button className="icon-btn" onClick={closeSettings} aria-label="Close settings"><IconClose /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label htmlFor="api-key">
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <IconKey size={12} /> OpenAI API Key
              </span>
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input id="api-key" className="input" type={show ? 'text' : 'password'} value={draft} onChange={e => setDraft(e.target.value)} placeholder="sk-..." autoComplete="off" spellCheck={false} />
              <button className="btn btn-secondary" onClick={() => setShow(s => !s)} type="button" style={{ flexShrink: 0 }} aria-label={show ? 'Hide key' : 'Show key'}>{show ? 'Hide' : 'Show'}</button>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>Your key is stored in memory only — never saved to disk or sent anywhere except the OpenAI API.</p>
          </div>
          <div className="divider" />
          <div className="field">
            <label htmlFor="default-model">Default Model</label>
            <select id="default-model" className="select" value={model} onChange={e => setModel(e.target.value)}>
              <optgroup label="OpenAI">
                <option value="gpt-4o">GPT-4o (most capable)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (fast &amp; cheap)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </optgroup>
            </select>
          </div>
          <div className="divider" />
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--color-text)' }}>Studio Spaces</strong> — Phase 0<br />
            A Spaces-first AI chat app.<br />
            <a href="https://github.com/nothinginfinity/studio-spaces" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>github.com/nothinginfinity/studio-spaces</a>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={closeSettings}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{saved ? '✓ Saved' : 'Save Settings'}</button>
        </div>
      </div>
    </div>
  )
}

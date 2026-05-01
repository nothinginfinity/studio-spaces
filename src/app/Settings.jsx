import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { IconClose, IconKey } from '../ui/Icons'
import { getSetting, setSetting } from '../db'

const PROVIDER_LABELS = [
  { key: 'openai',    label: 'OpenAI API Key',    placeholder: 'sk-...',         type: 'password' },
  { key: 'anthropic', label: 'Anthropic API Key', placeholder: 'sk-ant-...',     type: 'password' },
  { key: 'google',    label: 'Google API Key',    placeholder: 'AIza...',        type: 'password' },
  { key: 'groq',      label: 'Groq API Key',      placeholder: 'gsk_...',        type: 'password' },
  { key: 'ollamaUrl', label: 'Ollama Base URL',   placeholder: 'http://localhost:11434', type: 'text' },
]

export function Settings() {
  const { apiKeys, setApiKey, githubToken, setGithubToken, closeSettings } = useStore()
  const [drafts, setDrafts] = useState({ ...apiKeys, ollamaUrl: apiKeys.ollamaUrl || 'http://localhost:11434' })
  const [githubDraft, setGithubDraft] = useState(githubToken)
  const [show, setShow] = useState({})
  const [saved, setSaved] = useState(false)

  // Load persisted keys from IndexedDB on open
  useEffect(() => {
    async function load() {
      const loaded = {}
      for (const p of PROVIDER_LABELS) {
        loaded[p.key] = await getSetting(`apiKey.${p.key}`, p.key === 'ollamaUrl' ? 'http://localhost:11434' : '')
      }
      const gh = await getSetting('githubToken', '')
      setDrafts(loaded)
      setGithubDraft(gh)
      // Sync into store so ChatView picks them up immediately
      for (const p of PROVIDER_LABELS) {
        setApiKey(p.key, loaded[p.key])
      }
      setGithubToken(gh)
    }
    load()
  }, [])

  function setDraft(key, value) {
    setDrafts(d => ({ ...d, [key]: value }))
  }

  async function handleSave() {
    for (const p of PROVIDER_LABELS) {
      await setSetting(`apiKey.${p.key}`, drafts[p.key] || '')
      setApiKey(p.key, drafts[p.key] || '')
    }
    await setSetting('githubToken', githubDraft)
    setGithubToken(githubDraft)
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

          {/* ── API Keys ─────────────────────────────────── */}
          <div className="panel-section-label" style={{ marginBottom: 'var(--space-3)' }}>API Keys</div>

          {PROVIDER_LABELS.map(p => (
            <div className="field" key={p.key} style={{ marginBottom: 'var(--space-3)' }}>
              <label htmlFor={`key-${p.key}`}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <IconKey size={12} /> {p.label}
                </span>
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  id={`key-${p.key}`}
                  className="input"
                  type={p.type === 'password' && !show[p.key] ? 'password' : 'text'}
                  value={drafts[p.key] || ''}
                  onChange={e => setDraft(p.key, e.target.value)}
                  placeholder={p.placeholder}
                  autoComplete="off"
                  spellCheck={false}
                />
                {p.type === 'password' && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShow(s => ({ ...s, [p.key]: !s[p.key] }))}
                    type="button"
                    style={{ flexShrink: 0 }}
                    aria-label={show[p.key] ? 'Hide key' : 'Show key'}
                  >
                    {show[p.key] ? 'Hide' : 'Show'}
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="divider" />

          {/* ── GitHub Token ─────────────────────────────── */}
          <div className="panel-section-label" style={{ marginBottom: 'var(--space-3)' }}>GitHub</div>
          <div className="field" style={{ marginBottom: 'var(--space-3)' }}>
            <label htmlFor="github-token">
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <IconKey size={12} /> GitHub Token
              </span>
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                id="github-token"
                className="input"
                type={show.github ? 'text' : 'password'}
                value={githubDraft}
                onChange={e => setGithubDraft(e.target.value)}
                placeholder="ghp_..."
                autoComplete="off"
                spellCheck={false}
              />
              <button
                className="btn btn-secondary"
                onClick={() => setShow(s => ({ ...s, github: !s.github }))}
                type="button"
                style={{ flexShrink: 0 }}
                aria-label={show.github ? 'Hide token' : 'Show token'}
              >
                {show.github ? 'Hide' : 'Show'}
              </button>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
              Used for MMCP inbox/outbox commits and browsing your repos. Stored in IndexedDB only.
            </p>
          </div>

          <div className="divider" />

          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--color-text)' }}>Studio Spaces</strong> — Phase 1.5<br />
            A Spaces-first multi-LLM AI chat app.<br />
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

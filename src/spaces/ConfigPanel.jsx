import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, updateSpace } from '../db'
import { useStore } from '../store'
import { IconClose, IconSliders } from '../ui/Icons'

export function ConfigPanel() {
  const { activeSpaceId, toggleConfigPanel } = useStore()
  const space = useLiveQuery(
    () => (activeSpaceId ? db.spaces.get(activeSpaceId) : null),
    [activeSpaceId]
  )

  const [instructions, setInstructions] = useState('')
  const [model, setModel] = useState('gpt-4o-mini')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (space) {
      setInstructions(space.instructions || '')
      setModel(space.model || 'gpt-4o-mini')
    }
  }, [space?.id])

  async function handleSave() {
    if (!activeSpaceId) return
    await updateSpace(activeSpaceId, { instructions, model })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  if (!space) return null

  return (
    <>
      <div className="panel-overlay" onClick={toggleConfigPanel} aria-hidden="true" />
      <aside className="panel" role="complementary" aria-label="Configure Space">
        <div className="panel-header">
          <span className="panel-title">
            <span style={{ marginRight: 'var(--space-2)' }}>{space.icon}</span>
            Configure Space
          </span>
          <button className="icon-btn" onClick={toggleConfigPanel} aria-label="Close panel">
            <IconClose />
          </button>
        </div>

        <div className="panel-body">
          <div className="panel-section">
            <div className="panel-section-label">AI Model</div>
            <div className="field">
              <label htmlFor="model-select">Model</label>
              <select
                id="model-select"
                className="select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <optgroup label="OpenAI">
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (fast)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="divider" />

          <div className="panel-section">
            <div className="panel-section-label">Custom Instructions</div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
              Added to every conversation in this Space as a system prompt.
            </p>
            <div className="field">
              <label htmlFor="instructions">System prompt</label>
              <textarea
                id="instructions"
                className="textarea textarea-tall"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="You are a focused research assistant. Always cite sources. Use clear headers when organizing long responses…"
              />
            </div>
          </div>

          <div className="divider" />

          <div className="panel-section">
            <div className="panel-section-label">Instruction Presets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start', gap: 'var(--space-3)', textAlign: 'left' }}
                  onClick={() => setInstructions(p.prompt)}
                  title={p.prompt}
                >
                  <span style={{ fontSize: 16 }}>{p.icon}</span>
                  <span>
                    <strong style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                      {p.label}
                    </strong>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {p.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="panel-footer">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {saved ? '✓ Saved' : 'Save Configuration'}
          </button>
        </div>
      </aside>
    </>
  )
}

const PRESETS = [
  {
    icon: '🔬',
    label: 'Research Analyst',
    description: 'Rigorous, cited, structured',
    prompt:
      'You are a rigorous research analyst. Always cite sources when possible. Structure your responses with clear headers. When uncertain, say so explicitly. Prefer depth over breadth.',
  },
  {
    icon: '✍️',
    label: 'Creative Writer',
    description: 'Expressive, imaginative, narrative',
    prompt:
      'You are a creative writing collaborator. Be expressive, imaginative, and narrative-driven. Prioritize voice, flow, and emotional resonance over rigid structure.',
  },
  {
    icon: '💻',
    label: 'Code Reviewer',
    description: 'Technical, precise, actionable',
    prompt:
      'You are an expert code reviewer. Be technically precise. Point out bugs, performance issues, and style concerns. Always suggest concrete improvements with code examples.',
  },
  {
    icon: '📋',
    label: 'Strict Editor',
    description: 'Concise, direct, no filler',
    prompt:
      'You are a strict editor. Be concise and direct. Remove filler words. Every sentence must earn its place. Prefer active voice. Flag anything vague or redundant.',
  },
  {
    icon: '🧠',
    label: 'Socratic Coach',
    description: 'Questions over answers',
    prompt:
      'You are a Socratic coach. Instead of giving direct answers, ask probing questions that help the user arrive at insights themselves. Encourage deeper thinking.',
  },
]

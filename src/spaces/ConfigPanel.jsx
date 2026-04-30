import { useState } from 'react'
import { db } from '../db'
import { IconClose } from '../ui/Icons'

const ICONS = ['✦','🔬','✍️','💻','📚','🎨','🧠','📊','🗂️','🚀','⚡','🌿','📎','🔗','🎯','💡']

export function ConfigPanel({ space, onClose }) {
  const [name, setName] = useState(space.name)
  const [icon, setIcon] = useState(space.icon)
  const [instructions, setInstructions] = useState(space.instructions || '')
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    await db.spaces.update(space.id, { name, icon, instructions, updatedAt: Date.now() })
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 900)
  }

  return (
    <>
      <div className="panel-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="panel" role="dialog" aria-modal="true" aria-label="Configure Space">
        <div className="panel-header">
          <span className="panel-title">⚙️  Configure Space</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close panel"><IconClose /></button>
        </div>
        <div className="panel-body">
          <div className="panel-section">
            <div className="panel-section-label">Name</div>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Space name" />
          </div>
          <div className="panel-section">
            <div className="panel-section-label">Icon</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  style={{
                    fontSize: 20, padding: 'var(--space-2)', borderRadius: 'var(--radius-md)',
                    background: ic === icon ? 'var(--color-primary-highlight)' : 'var(--color-surface-offset)',
                    border: ic === icon ? '2px solid var(--color-primary)' : '2px solid transparent',
                    cursor: 'pointer', lineHeight: 1
                  }}
                  aria-label={`Set icon ${ic}`}
                  aria-pressed={ic === icon}
                >{ic}</button>
              ))}
            </div>
          </div>
          <div className="panel-section">
            <div className="panel-section-label">Instructions</div>
            <textarea
              className="textarea textarea-tall"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. You are a senior Python engineer. Always show code with type hints."
            />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>These instructions are prepended to every conversation in this Space as a system prompt.</p>
          </div>
        </div>
        <div className="panel-footer">
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      </aside>
    </>
  )
}

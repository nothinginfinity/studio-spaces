import { useState } from 'react'
import { updateSpace } from '../db'
import { IconClose } from '../ui/Icons'

const ICONS = ['✦','🔬','✍️','💻','📚','🎨','🧠','📊','🗂️','🚀','⚡','🌿','🎯','🏇️','🔭','🎵','📐','🔑']

export function RenameModal({ space, onClose }) {
  const [name, setName] = useState(space.name)
  const [icon, setIcon] = useState(space.icon)

  async function handleSave() {
    if (!name.trim()) return
    await updateSpace(space.id, { name: name.trim(), icon })
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Rename space">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Rename Space</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label htmlFor="space-name">Space name</label>
            <input
              id="space-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
              placeholder="Space name"
            />
          </div>
          <div className="field">
            <label>Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  style={{
                    fontSize: 18,
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    background:
                      ic === icon
                        ? 'var(--color-primary-highlight)'
                        : 'var(--color-surface-offset)',
                    border:
                      ic === icon
                        ? '2px solid var(--color-primary)'
                        : '2px solid transparent',
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                  aria-label={`Icon ${ic}`}
                  aria-pressed={ic === icon}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!name.trim()}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

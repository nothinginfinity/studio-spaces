import { useState } from 'react'
import { db } from '../db'
import { IconClose } from '../ui/Icons'

export function RenameModal({ space, onClose }) {
  const [name, setName] = useState(space.name)

  async function handleSave() {
    if (name.trim()) {
      await db.spaces.update(space.id, { name: name.trim(), updatedAt: Date.now() })
    }
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Rename Space">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Rename Space</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label htmlFor="rename-input">Space name</label>
            <input id="rename-input" className="input" value={name} autoFocus onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose() }} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Rename</button>
        </div>
      </div>
    </div>
  )
}

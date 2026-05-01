import { useState } from 'react'
import { createSpace } from '../db'
import { useStore } from '../store'
import { IconClose } from '../ui/Icons'

const ICONS = ['✦','🔬','✍️','💻','📚','🎨','🧠','📊','🗂️','🚀','⚡','🌿','🎯','🔭','🎵','📐','🔑']

function toSlug(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '-')
}

export function NewSpaceModal({ projectId }) {
  const { closeNewSpaceModal, setActiveSpace } = useStore()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('✦')
  const [role, setRole] = useState('')
  const slug = toSlug(name)
  const [inboxPath, setInboxPath] = useState('')
  const [outboxPath, setOutboxPath] = useState('')

  // Keep paths in sync with name until user manually edits them
  const [inboxDirty, setInboxDirty] = useState(false)
  const [outboxDirty, setOutboxDirty] = useState(false)

  const effectiveInbox  = inboxDirty  ? inboxPath  : (slug ? `spaces/${slug}/inbox.md`  : '')
  const effectiveOutbox = outboxDirty ? outboxPath : (slug ? `spaces/${slug}/outbox.md` : '')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const id = await createSpace({
      projectId,
      name: name.trim(),
      icon,
      role,
      inboxPath: effectiveInbox,
      outboxPath: effectiveOutbox,
    })
    closeNewSpaceModal()
    setActiveSpace(id)
  }

  return (
    <div className="overlay" onClick={closeNewSpaceModal} role="dialog" aria-modal="true" aria-label="New space">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">New Space</span>
          <button className="icon-btn" onClick={closeNewSpaceModal} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="field">
              <label htmlFor="space-name">Space name</label>
              <input
                id="space-name"
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                placeholder="Alice"
                required
              />
            </div>

            <div className="field">
              <label>Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {ICONS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    style={{
                      fontSize: 18,
                      padding: 'var(--space-2)',
                      borderRadius: 'var(--radius-md)',
                      background: ic === icon ? 'var(--color-primary-highlight)' : 'var(--color-surface-offset)',
                      border: ic === icon ? '2px solid var(--color-primary)' : '2px solid transparent',
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

            <div className="field">
              <label htmlFor="space-role">Role / instructions <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
              <textarea
                id="space-role"
                className="textarea"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="You are Alice, a UI engineer working on Studio Spaces…"
              />
            </div>

            <div className="field">
              <label htmlFor="space-inbox">Inbox path</label>
              <input
                id="space-inbox"
                className="input"
                value={effectiveInbox}
                onChange={e => { setInboxPath(e.target.value); setInboxDirty(true) }}
                placeholder={slug ? `spaces/${slug}/inbox.md` : 'spaces/name/inbox.md'}
              />
            </div>

            <div className="field">
              <label htmlFor="space-outbox">Outbox path</label>
              <input
                id="space-outbox"
                className="input"
                value={effectiveOutbox}
                onChange={e => { setOutboxPath(e.target.value); setOutboxDirty(true) }}
                placeholder={slug ? `spaces/${slug}/outbox.md` : 'spaces/name/outbox.md'}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeNewSpaceModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>Create Space</button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, createSpace, deleteSpace } from '../db'
import { useStore } from '../store'
import { ThemeToggle } from './ThemeToggle'
import { IconSpaces, IconPlus, IconEdit, IconTrash, IconSettings, IconClose } from '../ui/Icons'
import { RenameModal } from '../spaces/RenameModal'

const ICONS = ['\u2726','\ud83d\udd2c','\u270d\ufe0f','\ud83d\udcbb','\ud83d\udcda','\ud83c\udfa8','\ud83e\udde0','\ud83d\udcca','\ud83d\uddc2\ufe0f','\ud83d\ude80','\u26a1','\ud83c\udf3f']
function randomIcon() { return ICONS[Math.floor(Math.random() * ICONS.length)] }

export function Sidebar({ open, onClose, onSelectSpace }) {
  const spaces = useLiveQuery(() => db.spaces.orderBy('updatedAt').reverse().toArray(), [])
  const { activeSpaceId, setActiveSpace, openSettings } = useStore()
  const [renaming, setRenaming] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function handleNew() {
    const id = await createSpace({ name: 'New Space', icon: randomIcon() })
    if (onSelectSpace) onSelectSpace(id)
    else setActiveSpace(id)
  }

  async function handleDelete(id) {
    if (activeSpaceId === id) setActiveSpace(null)
    await deleteSpace(id)
    setConfirmDelete(null)
  }

  function handleSelect(id) {
    if (onSelectSpace) onSelectSpace(id)
    else setActiveSpace(id)
  }

  return (
    <>
      <aside
        className={`sidebar ${open ? 'sidebar--open' : ''}`}
        role="navigation"
        aria-label="Spaces"
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon" aria-hidden="true"><IconSpaces size={14} /></div>
            <span className="sidebar-logo-text">Studio Spaces</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <ThemeToggle />
            {/* Close button — visible only on mobile */}
            <button
              className="icon-btn sidebar-close-btn"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <IconClose size={16} />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Spaces</div>
          {spaces?.map(space => (
            <div
              key={space.id}
              className={`space-item ${activeSpaceId === space.id ? 'active' : ''}`}
              onClick={() => handleSelect(space.id)}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleSelect(space.id)}
              aria-current={activeSpaceId === space.id ? 'page' : undefined}
            >
              <span className="space-item-icon" aria-hidden="true">{space.icon}</span>
              <span className="space-item-name">{space.name}</span>
              <span className="space-item-actions" onClick={e => e.stopPropagation()}>
                <button className="icon-btn" onClick={() => setRenaming(space)} aria-label={`Rename ${space.name}`} title="Rename">
                  <IconEdit size={13} />
                </button>
                <button className="icon-btn" onClick={() => setConfirmDelete(space.id)} aria-label={`Delete ${space.name}`} title="Delete" style={{ color: 'var(--color-error)' }}>
                  <IconTrash size={13} />
                </button>
              </span>
            </div>
          ))}
          {!spaces?.length && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', padding: 'var(--space-2) var(--space-3)' }}>No spaces yet</p>
          )}
          <button className="new-space-btn" onClick={handleNew} aria-label="Create new space">
            <IconPlus size={14} />New Space
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="settings-btn" onClick={openSettings}>
            <IconSettings size={15} />Settings
          </button>
        </div>
      </aside>

      {renaming && <RenameModal space={renaming} onClose={() => setRenaming(null)} />}

      {confirmDelete && (
        <div className="overlay" onClick={() => setConfirmDelete(null)} role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Delete Space?</span></div>
            <div className="modal-body">
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>This will permanently delete the space and all its messages. This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleDelete(confirmDelete)} style={{ background: 'var(--color-error)' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

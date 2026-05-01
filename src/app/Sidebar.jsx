import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, deleteSpace } from '../db'
import { useStore } from '../store'
import { ThemeToggle } from './ThemeToggle'
import { IconSpaces, IconEdit, IconTrash, IconSettings, IconClose, IconPlus } from '../ui/Icons'
import { RenameModal } from '../spaces/RenameModal'

export function Sidebar({ open, onClose, onSelectSpace }) {
  const projects = useLiveQuery(() => db.projects.orderBy('createdAt').toArray(), [])
  const allSpaces = useLiveQuery(() => db.spaces.orderBy('updatedAt').reverse().toArray(), [])
  const { activeSpaceId, setActiveSpace, openSettings, openNewProjectModal, openNewSpaceModal } = useStore()
  const [collapsed, setCollapsed] = useState({})
  const [renaming, setRenaming] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function handleDelete(id) {
    if (activeSpaceId === id) setActiveSpace(null)
    await deleteSpace(id)
    setConfirmDelete(null)
  }

  function handleSelect(id) {
    if (onSelectSpace) onSelectSpace(id)
    else setActiveSpace(id)
  }

  function toggleProject(id) {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Group spaces by projectId
  const spacesFor = (projectId) =>
    (allSpaces || []).filter(s => s.projectId === projectId)

  const legacySpaces = (allSpaces || []).filter(
    s => s.projectId === 'default' && !(projects || []).find(p => p.id === s.projectId)
  )

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
          {/* Render project groups */}
          {(projects || []).map(project => {
            const pSpaces = spacesFor(project.id)
            const isCollapsed = collapsed[project.id]
            const repoChip = project.repoUrl
              ? (() => { try { return new URL(project.repoUrl).hostname.replace('www.', '') } catch { return project.repoUrl } })()
              : null

            return (
              <div key={project.id} className="project-group">
                <button
                  className="project-group-header"
                  onClick={() => toggleProject(project.id)}
                  aria-expanded={!isCollapsed}
                >
                  <span className="project-group-chevron">{isCollapsed ? '▸' : '▾'}</span>
                  <span className="project-group-name">{project.name}</span>
                  {repoChip && <span className="project-repo-chip">{repoChip}</span>}
                </button>

                {!isCollapsed && (
                  <div className="project-group-spaces">
                    {pSpaces.map(space => (
                      <SpaceItem
                        key={space.id}
                        space={space}
                        active={activeSpaceId === space.id}
                        onSelect={() => handleSelect(space.id)}
                        onRename={() => setRenaming(space)}
                        onDelete={() => setConfirmDelete(space.id)}
                      />
                    ))}
                    {pSpaces.length === 0 && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', padding: 'var(--space-1) var(--space-3) var(--space-1) var(--space-5)' }}>No spaces</p>
                    )}
                    <button
                      className="new-space-btn new-space-btn--nested"
                      onClick={() => openNewSpaceModal(project.id)}
                      aria-label={`New space in ${project.name}`}
                    >
                      <IconPlus size={12} />New Space
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Legacy / uncategorised spaces */}
          {legacySpaces.length > 0 && (
            <div className="project-group">
              <div className="sidebar-section-label" style={{ padding: 'var(--space-2) var(--space-3)' }}>Uncategorised</div>
              {legacySpaces.map(space => (
                <SpaceItem
                  key={space.id}
                  space={space}
                  active={activeSpaceId === space.id}
                  onSelect={() => handleSelect(space.id)}
                  onRename={() => setRenaming(space)}
                  onDelete={() => setConfirmDelete(space.id)}
                />
              ))}
            </div>
          )}

          {/* No projects yet */}
          {!(projects || []).length && !legacySpaces.length && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', padding: 'var(--space-2) var(--space-3)' }}>No projects yet</p>
          )}

          {/* + New Project — always at bottom of nav */}
          <button
            className="new-space-btn"
            style={{ marginTop: 'auto' }}
            onClick={() => openNewProjectModal()}
            aria-label="Create new project"
          >
            <IconPlus size={14} />New Project
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

function SpaceItem({ space, active, onSelect, onRename, onDelete }) {
  return (
    <div
      className={`space-item space-item--nested ${active ? 'active' : ''}`}
      onClick={onSelect}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
      aria-current={active ? 'page' : undefined}
    >
      <span className="space-item-icon" aria-hidden="true">{space.icon}</span>
      <span className="space-item-name">{space.name}</span>
      <span className="space-item-actions" onClick={e => e.stopPropagation()}>
        <button className="icon-btn" onClick={onRename} aria-label={`Rename ${space.name}`} title="Rename">
          <IconEdit size={13} />
        </button>
        <button className="icon-btn" onClick={onDelete} aria-label={`Delete ${space.name}`} title="Delete" style={{ color: 'var(--color-error)' }}>
          <IconTrash size={13} />
        </button>
      </span>
    </div>
  )
}

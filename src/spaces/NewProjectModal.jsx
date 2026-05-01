import { useState } from 'react'
import { createProject, parseRepoUrl } from '../db'
import { useStore } from '../store'
import { IconClose } from '../ui/Icons'

export function NewProjectModal() {
  const { closeNewProjectModal, setActiveProject } = useStore()
  const [name, setName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')

  const parsed = parseRepoUrl(repoUrl)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !repoUrl.trim()) return
    const id = await createProject({ name: name.trim(), repoUrl: repoUrl.trim() })
    setActiveProject(id)
    closeNewProjectModal()
  }

  return (
    <div className="overlay" onClick={closeNewProjectModal} role="dialog" aria-modal="true" aria-label="New project">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">New Project</span>
          <button className="icon-btn" onClick={closeNewProjectModal} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="field">
              <label htmlFor="proj-name">Project name</label>
              <input
                id="proj-name"
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                placeholder="studio-spaces"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="proj-repo">GitHub repo URL</label>
              <input
                id="proj-repo"
                className="input"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                required
              />
              {repoUrl && (
                <p style={{ fontSize: 'var(--text-xs)', color: parsed.repoOwner ? 'var(--color-text-muted)' : 'var(--color-error)', marginTop: 'var(--space-1)' }}>
                  {parsed.repoOwner
                    ? <><strong>{parsed.repoOwner}</strong> / <strong>{parsed.repoName}</strong></>
                    : 'Could not parse owner/repo from URL'}
                </p>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeNewProjectModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim() || !repoUrl.trim() || !parsed.repoOwner}>
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

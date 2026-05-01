import { useState, useEffect, useRef } from 'react'
import { createProject, parseRepoUrl } from '../db'
import { useStore } from '../store'
import { IconClose } from '../ui/Icons'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export function NewProjectModal() {
  const { closeNewProjectModal, setActiveProject, githubToken } = useStore()
  const [mode, setMode] = useState('url') // 'url' | 'browse'
  const [name, setName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')

  // Browse state
  const [repos, setRepos] = useState([])
  const [reposLoading, setReposLoading] = useState(false)
  const [reposError, setReposError] = useState(null)
  const [filter, setFilter] = useState('')
  const fetchedRef = useRef(false)

  const parsed = parseRepoUrl(repoUrl)

  async function fetchRepos() {
    if (!githubToken) { setReposError('no-token'); return }
    setReposLoading(true)
    setReposError(null)
    try {
      const res = await fetch(
        'https://api.github.com/user/repos?sort=updated&per_page=50&visibility=all',
        { headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github+json' } }
      )
      if (!res.ok) throw new Error(`GitHub API ${res.status}`)
      const data = await res.json()
      setRepos(data)
    } catch (err) {
      setReposError('fetch-fail')
    } finally {
      setReposLoading(false)
    }
  }

  function handleModeSwitch(m) {
    setMode(m)
    if (m === 'browse' && !fetchedRef.current) {
      fetchedRef.current = true
      fetchRepos()
    }
  }

  function handleRepoSelect(repo) {
    setRepoUrl(`https://github.com/${repo.full_name}`)
    if (!name) setName(repo.name)
    setMode('url')
  }

  const filtered = filter
    ? repos.filter(r => r.full_name.toLowerCase().includes(filter.toLowerCase()))
    : repos

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !repoUrl.trim()) return
    const id = await createProject({ name: name.trim(), repoUrl: repoUrl.trim() })
    setActiveProject(id)
    closeNewProjectModal()
  }

  return (
    <div className="overlay" onClick={closeNewProjectModal} role="dialog" aria-modal="true" aria-label="New project">
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <span className="modal-title">New Project</span>
          <button className="icon-btn" onClick={closeNewProjectModal} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {/* ── Project name ─────────────────────────── */}
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

            {/* ── Repo URL / Browse toggle ──────────────── */}
            <div className="field">
              <label>GitHub Repo</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${mode === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleModeSwitch('url')}
                >
                  Paste URL
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${mode === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleModeSwitch('browse')}
                >
                  Browse repos ↓
                </button>
              </div>

              {mode === 'url' && (
                <>
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
                </>
              )}

              {mode === 'browse' && (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  {/* No token */}
                  {reposError === 'no-token' && (
                    <div style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      Add your GitHub token in Settings to browse repos.
                      <br />
                      <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-2)', textDecoration: 'underline' }}
                        onClick={() => { closeNewProjectModal(); /* user opens settings manually */ }}>
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Fetch fail */}
                  {reposError === 'fetch-fail' && (
                    <div style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-error)', textAlign: 'center' }}>
                      Could not load repos — paste URL instead.
                      <br />
                      <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-2)' }}
                        onClick={() => setMode('url')}>
                        Use URL mode
                      </button>
                    </div>
                  )}

                  {/* Loading */}
                  {reposLoading && (
                    <div style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      Loading repos…
                    </div>
                  )}

                  {/* Repo list */}
                  {!reposLoading && !reposError && (
                    <>
                      <div style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
                        <input
                          className="input"
                          placeholder="Filter repos…"
                          value={filter}
                          onChange={e => setFilter(e.target.value)}
                          style={{ fontSize: 'var(--text-xs)' }}
                        />
                      </div>
                      <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                        {filtered.length === 0 && (
                          <div style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                            No repos found.
                          </div>
                        )}
                        {filtered.map(repo => (
                          <button
                            key={repo.id}
                            type="button"
                            onClick={() => handleRepoSelect(repo)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              width: '100%',
                              padding: 'var(--space-3) var(--space-4)',
                              borderBottom: '1px solid var(--color-border)',
                              background: 'none',
                              border: 'none',
                              borderBottom: '1px solid var(--color-border)',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-offset)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%' }}>
                              <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', flex: 1 }}>{repo.name}</span>
                              {repo.private && (
                                <span style={{
                                  fontSize: 10,
                                  padding: '1px 6px',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'var(--color-surface-offset)',
                                  color: 'var(--color-text-muted)',
                                  border: '1px solid var(--color-border)',
                                }}>private</span>
                              )}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                              {repo.owner.login} · updated {timeAgo(repo.updated_at)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeNewProjectModal}>Cancel</button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!name.trim() || !repoUrl.trim() || !parsed.repoOwner}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

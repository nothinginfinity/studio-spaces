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
  const project = useLiveQuery(
    () => (space?.projectId && space.projectId !== 'default' ? db.projects.get(space.projectId) : null),
    [space?.projectId]
  )

  const [role, setRole] = useState('')
  const [inboxPath, setInboxPath] = useState('')
  const [outboxPath, setOutboxPath] = useState('')
  const [model, setModel] = useState('gpt-4o-mini')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (space) {
      setRole(space.role || '')
      setInboxPath(space.inboxPath || '')
      setOutboxPath(space.outboxPath || '')
      setModel(space.model || 'gpt-4o-mini')
    }
  }, [space?.id])

  async function handleSave() {
    if (!activeSpaceId) return
    await updateSpace(activeSpaceId, { role, inboxPath, outboxPath, model })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  if (!space) return null

  const panelSubtitle = project
    ? `${project.name} / ${space.name}`
    : space.name

  return (
    <>
      <div className="panel-overlay" onClick={toggleConfigPanel} aria-hidden="true" />
      <aside className="panel" role="complementary" aria-label="Configure Space">
        <div className="panel-header">
          <span className="panel-title">
            <span style={{ marginRight: 'var(--space-2)' }}>{space.icon}</span>
            {panelSubtitle}
          </span>
          <button className="icon-btn" onClick={toggleConfigPanel} aria-label="Close panel">
            <IconClose />
          </button>
        </div>

        <div className="panel-body">

          {/* ── Connection Role ───────────────────────────── */}
          <div className="panel-section">
            <div className="panel-section-label">Connection Role</div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
              Defines this Space's identity within its project — what it owns,
              who it talks to, and what context it carries into every message.
            </p>
            <div className="field">
              <label htmlFor="role">Role / system context</label>
              <textarea
                id="role"
                className="textarea textarea-tall"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder={`You are the ${space.name} agent in this project.\nYou have authority over: [list files]\nYou send messages to: [list connected spaces]\nYour focus: [describe what this space does]`}
              />
            </div>
          </div>

          <div className="divider" />

          {/* ── Connection Role Presets ───────────────────── */}
          <div className="panel-section">
            <div className="panel-section-label">Connection Role Presets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {ROLE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start', gap: 'var(--space-3)', textAlign: 'left' }}
                  onClick={() => setRole(p.role)}
                  title={p.role}
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

          <div className="divider" />

          {/* ── MMCP Paths ───────────────────────────────── */}
          <div className="panel-section">
            <div className="panel-section-label">MMCP Paths</div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
              Inbox and outbox files in the repo this Space reads from and writes to.
            </p>
            <div className="field" style={{ marginBottom: 'var(--space-3)' }}>
              <label htmlFor="inbox-path">Inbox path</label>
              <input
                id="inbox-path"
                className="input"
                value={inboxPath}
                onChange={(e) => setInboxPath(e.target.value)}
                placeholder="spaces/name/inbox.md"
              />
            </div>
            <div className="field">
              <label htmlFor="outbox-path">Outbox path</label>
              <input
                id="outbox-path"
                className="input"
                value={outboxPath}
                onChange={(e) => setOutboxPath(e.target.value)}
                placeholder="spaces/name/outbox.md"
              />
            </div>
          </div>

          <div className="divider" />

          {/* ── AI Model ─────────────────────────────────── */}
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

// ─── Connection Role Presets ──────────────────────────────────────────
// These describe what a Space *does* in a project network — not what
// personality a generic LLM should pretend to have.
const ROLE_PRESETS = [
  {
    icon: '🔧',
    label: 'CI / DevOps Agent',
    description: 'Owns pipelines, build config, deploy',
    role:
      'You are the CI/DevOps agent in this project.\n' +
      'You have authority over: .github/workflows/, package.json, vite.config.js\n' +
      'You send messages to: the Frontend agent, the Owner\n' +
      'Your focus: pipeline health, build reliability, deploy correctness.\n' +
      'When you complete a task, append a summary to your outbox and notify\n' +
      'any affected agents via their inbox.',
  },
  {
    icon: '🎨',
    label: 'Frontend Agent',
    description: 'Owns UI components, styles, UX',
    role:
      'You are the Frontend agent in this project.\n' +
      'You have authority over: src/app/, src/spaces/, src/ui/, src/app.css\n' +
      'You send messages to: the CI agent, the Owner\n' +
      'Your focus: component correctness, design system consistency, UX quality.\n' +
      'When you complete a task, append a summary to your outbox and notify\n' +
      'any affected agents via their inbox.',
  },
  {
    icon: '🗄️',
    label: 'Data / Backend Agent',
    description: 'Owns schema, API, persistence layer',
    role:
      'You are the Data/Backend agent in this project.\n' +
      'You have authority over: src/db.js, src/store.js, src/ai/\n' +
      'You send messages to: the Frontend agent, the CI agent\n' +
      'Your focus: schema integrity, migration safety, API contract stability.\n' +
      'When you complete a task, append a summary to your outbox and notify\n' +
      'any affected agents via their inbox.',
  },
  {
    icon: '📋',
    label: 'Project Owner',
    description: 'Oversees all agents, sets direction',
    role:
      'You are the project owner.\n' +
      'You have visibility over: all spaces, all inboxes, ROADMAPspaces.md\n' +
      'You send messages to: any agent\n' +
      'Your focus: cross-agent coordination, milestone tracking, unblocking agents.\n' +
      'You make final decisions on architecture and priorities.',
  },
  {
    icon: '🔗',
    label: 'Relay / Bridge Agent',
    description: 'Routes messages between projects',
    role:
      'You are a relay agent bridging two or more projects.\n' +
      'You have authority over: your inbox and outbox in each connected project\n' +
      'Your focus: translating context between project namespaces, forwarding\n' +
      'relevant signals, preventing duplicate work across repos.\n' +
      'You do not own code — you own communication.',
  },
]

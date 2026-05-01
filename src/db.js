import Dexie from 'dexie'

export const db = new Dexie('StudioSpaces')

// ─── Schema versions ──────────────────────────────────────────────────
// v1: original — spaces + messages only
// v2: Phase 1 — add projects table; extend spaces with projectId + MMCP fields
db.version(1).stores({
  spaces:   '++id, name, createdAt, updatedAt',
  messages: '++id, spaceId, role, createdAt',
})

db.version(2).stores({
  projects: '++id, name, createdAt',
  spaces:   '++id, projectId, name, createdAt, updatedAt',
  messages: '++id, spaceId, role, createdAt',
}).upgrade(tx => {
  // Migrate existing spaces: assign to a default project
  return tx.table('spaces').toCollection().modify(space => {
    if (!space.projectId) space.projectId = 'default'
  })
})

// ─── Project helpers ──────────────────────────────────────────────────
// Project shape:
// {
//   id:         auto (Dexie ++id)
//   name:       string          — display name, e.g. "studio-spaces"
//   repoUrl:    string          — e.g. "https://github.com/nothinginfinity/studio-spaces"
//   repoOwner:  string          — e.g. "nothinginfinity"
//   repoName:   string          — e.g. "studio-spaces"
//   createdAt:  ISO string
// }
export async function createProject({ name = 'New Project', repoUrl = '' } = {}) {
  const now = new Date().toISOString()
  const { repoOwner, repoName } = parseRepoUrl(repoUrl)
  const id = await db.projects.add({ name, repoUrl, repoOwner, repoName, createdAt: now })
  return id
}

export async function updateProject(id, patch) {
  // Re-parse owner/name if repoUrl changed
  if (patch.repoUrl) {
    const { repoOwner, repoName } = parseRepoUrl(patch.repoUrl)
    patch = { ...patch, repoOwner, repoName }
  }
  await db.projects.update(id, patch)
}

export async function deleteProject(id) {
  await db.transaction('rw', db.projects, db.spaces, db.messages, async () => {
    const spaces = await db.spaces.where('projectId').equals(id).toArray()
    for (const s of spaces) {
      await db.messages.where('spaceId').equals(s.id).delete()
    }
    await db.spaces.where('projectId').equals(id).delete()
    await db.projects.delete(id)
  })
}

// ─── Space helpers ────────────────────────────────────────────────────
// Space shape:
// {
//   id:              auto (Dexie ++id)
//   projectId:       number | 'default'  — parent project
//   name:            string              — e.g. "Bob"
//   icon:            string              — emoji
//   role:            string              — system instructions / persona
//   inboxPath:       string              — e.g. "spaces/bob/inbox.md"
//   outboxPath:      string              — e.g. "spaces/bob/outbox.md"
//   linkedFiles:     string[]            — files this Space has authority over
//   mmcpConnections: MmcpConnection[]   — Spaces this Space can message
//   createdAt:       ISO string
//   updatedAt:       ISO string
// }
//
// MmcpConnection shape:
// {
//   spaceId:    number | string  — target space id (or label if cross-project)
//   label:      string           — display name for the target
//   inboxPath:  string           — target inbox path in target repo
//   repoOwner:  string           — target repo owner (may differ from parent project)
//   repoName:   string           — target repo name
// }

export async function createSpace({
  projectId = 'default',
  name = 'New Space',
  icon = '\u2726',
  role = '',
  inboxPath = '',
  outboxPath = '',
  linkedFiles = [],
  mmcpConnections = [],
} = {}) {
  const now = new Date().toISOString()
  // Auto-suggest inbox/outbox paths from name if not provided
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  const resolvedInbox  = inboxPath  || `spaces/${slug}/inbox.md`
  const resolvedOutbox = outboxPath || `spaces/${slug}/outbox.md`
  const id = await db.spaces.add({
    projectId,
    name,
    icon,
    role,
    inboxPath: resolvedInbox,
    outboxPath: resolvedOutbox,
    linkedFiles,
    mmcpConnections,
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export async function updateSpace(id, patch) {
  await db.spaces.update(id, { ...patch, updatedAt: new Date().toISOString() })
}

export async function deleteSpace(id) {
  await db.transaction('rw', db.spaces, db.messages, async () => {
    await db.spaces.delete(id)
    await db.messages.where('spaceId').equals(id).delete()
  })
}

// ─── Message helpers ──────────────────────────────────────────────────
export async function addMessage({ spaceId, role, content }) {
  const id = await db.messages.add({
    spaceId,
    role,
    content,
    createdAt: new Date().toISOString(),
  })
  return id
}

export async function getMessages(spaceId) {
  return db.messages.where('spaceId').equals(spaceId).sortBy('createdAt')
}

export async function clearMessages(spaceId) {
  await db.messages.where('spaceId').equals(spaceId).delete()
}

// ─── Utilities ────────────────────────────────────────────────────────
// Parse "https://github.com/owner/repo" or "owner/repo" into parts.
export function parseRepoUrl(url = '') {
  const clean = url.trim().replace(/\.git$/, '')
  const match = clean.match(/([\w.-]+)\/([\w.-]+)$/)
  if (!match) return { repoOwner: '', repoName: '' }
  return { repoOwner: match[1], repoName: match[2] }
}

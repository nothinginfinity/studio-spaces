import Dexie from 'dexie'

export const db = new Dexie('StudioSpaces')

// ─── Schema versions ──────────────────────────────────────────────────
// v1: original — spaces + messages only
// v2: Phase 1 — add projects table; extend spaces with projectId + MMCP fields
// v3: Phase 1.5 — add provider field to spaces; add settings table
db.version(1).stores({
  spaces:   '++id, name, createdAt, updatedAt',
  messages: '++id, spaceId, role, createdAt',
})

db.version(2).stores({
  projects: '++id, name, createdAt',
  spaces:   '++id, projectId, name, createdAt, updatedAt',
  messages: '++id, spaceId, role, createdAt',
}).upgrade(tx => {
  return tx.table('spaces').toCollection().modify(space => {
    if (!space.projectId) space.projectId = 'default'
  })
})

db.version(3).stores({
  projects: '++id, name, createdAt',
  spaces:   '++id, projectId, name, createdAt, updatedAt',
  messages: '++id, spaceId, role, createdAt',
  settings: 'key',
}).upgrade(tx => {
  return tx.table('spaces').toCollection().modify(space => {
    if (!space.provider) space.provider = 'openai'
    if (!space.model)    space.model    = 'gpt-4o-mini'
  })
})

// ─── Settings helpers (key/value store in IndexedDB) ─────────────────
export async function getSetting(key, fallback = '') {
  const row = await db.settings.get(key)
  return row ? row.value : fallback
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value })
}

// ─── Project helpers ──────────────────────────────────────────────────
export async function createProject({ name = 'New Project', repoUrl = '' } = {}) {
  const now = new Date().toISOString()
  const { repoOwner, repoName } = parseRepoUrl(repoUrl)
  const id = await db.projects.add({ name, repoUrl, repoOwner, repoName, createdAt: now })
  return id
}

export async function updateProject(id, patch) {
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
export async function createSpace({
  projectId = 'default',
  name = 'New Space',
  icon = '\u2726',
  role = '',
  inboxPath = '',
  outboxPath = '',
  provider = 'openai',
  model = 'gpt-4o-mini',
  linkedFiles = [],
  mmcpConnections = [],
} = {}) {
  const now = new Date().toISOString()
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  const resolvedInbox  = inboxPath  || `spaces/${slug}/inbox.md`
  const resolvedOutbox = outboxPath || `spaces/${slug}/outbox.md`
  const id = await db.spaces.add({
    projectId, name, icon, role,
    inboxPath: resolvedInbox, outboxPath: resolvedOutbox,
    provider, model,
    linkedFiles, mmcpConnections,
    createdAt: now, updatedAt: now,
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
    spaceId, role, content,
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
export function parseRepoUrl(url = '') {
  const clean = url.trim().replace(/\.git$/, '')
  const match = clean.match(/([\w.-]+)\/([\w.-]+)$/)
  if (!match) return { repoOwner: '', repoName: '' }
  return { repoOwner: match[1], repoName: match[2] }
}

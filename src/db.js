import Dexie from 'dexie'

export const db = new Dexie('StudioSpaces')

db.version(1).stores({
  spaces:   '++id, name, createdAt, updatedAt',
  messages: '++id, spaceId, role, createdAt',
})

// ─── Space helpers ────────────────────────────────────────────────────
export async function createSpace({ name = 'New Space', icon = '✦', instructions = '' } = {}) {
  const now = new Date().toISOString()
  const id = await db.spaces.add({ name, icon, instructions, createdAt: now, updatedAt: now })
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

import Dexie from 'dexie'

export const db = new Dexie('StudioSpaces')
db.version(1).stores({
  spaces: '++id, updatedAt',
  messages: '++id, spaceId, createdAt'
})

export async function createSpace({ name, icon = '✦', instructions = '' }) {
  return db.spaces.add({ name, icon, instructions, createdAt: Date.now(), updatedAt: Date.now() })
}

export async function deleteSpace(id) {
  await db.messages.where('spaceId').equals(id).delete()
  await db.spaces.delete(id)
}

export async function addMessage({ spaceId, role, content }) {
  const id = await db.messages.add({ spaceId, role, content, createdAt: Date.now() })
  await db.spaces.update(spaceId, { updatedAt: Date.now() })
  return id
}

export async function clearMessages(spaceId) {
  await db.messages.where('spaceId').equals(spaceId).delete()
}

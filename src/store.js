import { create } from 'zustand'

const SESSION_KEY = 'ss_settings'

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export const useStore = create((set, get) => {
  const session = loadSession()
  return {
    activeSpaceId: null,
    settingsOpen: false,
    apiKey: session.apiKey || '',
    model: session.model || 'gpt-4o',

    setActiveSpace: (id) => set({ activeSpaceId: id }),
    openSettings: () => set({ settingsOpen: true }),
    closeSettings: () => set({ settingsOpen: false }),

    setApiKey: (key) => {
      set({ apiKey: key })
      const session = loadSession()
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, apiKey: key })) } catch {}
    },
    setModel: (model) => {
      set({ model })
      const session = loadSession()
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, model })) } catch {}
    },
  }
})

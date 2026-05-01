import { create } from 'zustand'

export const useStore = create((set) => ({
  // ─── Active selections ────────────────────────────────────────────
  activeProjectId: null,
  setActiveProject: (id) => set({ activeProjectId: id }),

  activeSpaceId: null,
  setActiveSpace: (id) => set({ activeSpaceId: id }),

  // ─── UI state ────────────────────────────────────────────────────
  configPanelOpen: false,
  settingsOpen: false,
  toggleConfigPanel: () => set((s) => ({ configPanelOpen: !s.configPanelOpen })),
  openSettings:  () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),

  // New Project modal
  newProjectModalOpen: false,
  openNewProjectModal:  () => set({ newProjectModalOpen: true }),
  closeNewProjectModal: () => set({ newProjectModalOpen: false }),

  // New Space modal (scoped to a project)
  newSpaceModalProjectId: null,
  openNewSpaceModal:  (projectId) => set({ newSpaceModalProjectId: projectId }),
  closeNewSpaceModal: () => set({ newSpaceModalProjectId: null }),

  // ─── API keys (in-memory; loaded from IndexedDB on Settings open) ─
  // keyed by provider: openai | anthropic | google | groq | ollamaUrl
  apiKeys: {
    openai: '',
    anthropic: '',
    google: '',
    groq: '',
    ollamaUrl: 'http://localhost:11434',
  },
  setApiKey: (provider, value) =>
    set((s) => ({ apiKeys: { ...s.apiKeys, [provider]: value } })),

  // GitHub token (stored in IndexedDB via db.settings)
  githubToken: '',
  setGithubToken: (token) => set({ githubToken: token }),

  // ─── Streaming assistant message (null = not streaming) ───────────
  streamingContent: null,
  setStreamingContent: (content) => set({ streamingContent: content }),
  clearStreaming: () => set({ streamingContent: null }),

  // ─── Bump to force message list refresh ──────────────────────────
  messageTick: 0,
  bumpMessageTick: () => set((s) => ({ messageTick: s.messageTick + 1 })),
}))

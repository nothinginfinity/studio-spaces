import { create } from 'zustand'

export const useStore = create((set) => ({
  // Active space
  activeSpaceId: null,
  setActiveSpace: (id) => set({ activeSpaceId: id }),

  // UI state
  configPanelOpen: false,
  settingsOpen: false,
  toggleConfigPanel: () => set((s) => ({ configPanelOpen: !s.configPanelOpen })),
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),

  // API key (in-memory only — never persisted)
  apiKey: '',
  setApiKey: (key) => set({ apiKey: key }),

  // Default model (individual spaces override this)
  model: 'gpt-4o-mini',
  setModel: (model) => set({ model }),

  // Streaming assistant message (null = not streaming)
  streamingContent: null,
  setStreamingContent: (content) => set({ streamingContent: content }),
  clearStreaming: () => set({ streamingContent: null }),

  // Bump to force message list refresh
  messageTick: 0,
  bumpMessageTick: () => set((s) => ({ messageTick: s.messageTick + 1 })),
}))

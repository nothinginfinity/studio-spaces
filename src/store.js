import { create } from 'zustand'

export const useStore = create((set) => ({
  activeSpaceId: null,
  setActiveSpace: (id) => set({ activeSpaceId: id }),

  configPanelOpen: false,
  settingsOpen: false,
  toggleConfigPanel: () => set(s => ({ configPanelOpen: !s.configPanelOpen })),
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),

  apiKey: '',
  setApiKey: (key) => set({ apiKey: key }),

  model: 'gpt-4o-mini',
  setModel: (model) => set({ model }),

  streamingContent: null,
  setStreamingContent: (content) => set({ streamingContent: content }),
  clearStreaming: () => set({ streamingContent: null }),

  messageTick: 0,
  bumpMessageTick: () => set(s => ({ messageTick: s.messageTick + 1 })),
}))

import { useState } from 'react'
import { useStore } from '../store'
import { Sidebar } from './Sidebar'
import { ChatView } from '../chat/ChatView'
import { Settings } from './Settings'
import { IconSpaces, IconPlus, IconMenu } from '../ui/Icons'
import { createSpace } from '../db'

export function App() {
  const { activeSpaceId, setActiveSpace, settingsOpen } = useStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleCreateFirst() {
    const id = await createSpace({ name: 'My First Space', icon: '\u2726' })
    setActiveSpace(id)
  }

  function handleSelectSpace(id) {
    setActiveSpace(id)
    setSidebarOpen(false) // auto-close drawer on mobile after selecting
  }

  return (
    <div className="app-shell">
      {/* Overlay — closes sidebar when tapping outside on mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectSpace={handleSelectSpace}
      />

      <main className="main-content" id="main-content" tabIndex={-1}>
        {/* Mobile top bar with hamburger */}
        <div className="mobile-topbar">
          <button
            className="icon-btn hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open spaces"
            aria-expanded={sidebarOpen}
          >
            <IconMenu size={18} />
          </button>
          <span className="mobile-topbar-title">Studio Spaces</span>
        </div>

        {activeSpaceId ? (
          <ChatView />
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><IconSpaces size={40} /></div>
            <h2>No Space selected</h2>
            <p>Select a Space from the sidebar, or create a new one to get started.</p>
            <button className="btn btn-primary" onClick={handleCreateFirst}>
              <IconPlus size={14} />
              Create your first Space
            </button>
          </div>
        )}
      </main>

      {settingsOpen && <Settings />}
    </div>
  )
}

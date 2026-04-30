import { useStore } from '../store'
import { Sidebar } from './Sidebar'
import { ChatView } from '../chat/ChatView'
import { Settings } from './Settings'
import { IconSpaces, IconPlus } from '../ui/Icons'
import { createSpace } from '../db'

export function App() {
  const { activeSpaceId, setActiveSpace, settingsOpen } = useStore()

  async function handleCreateFirst() {
    const id = await createSpace({ name: 'My First Space', icon: '✦' })
    setActiveSpace(id)
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content" id="main-content" tabIndex={-1}>
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

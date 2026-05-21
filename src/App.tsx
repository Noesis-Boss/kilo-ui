import { useState, useEffect } from 'react'
import { listSessions } from './api/kilo'
import type { Session } from './api/kilo'
import TaskRunner from './components/TaskRunner'
import SessionDetail from './components/SessionDetail'

function App() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (selectedSessionId) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <h1>Kilo Web UI</h1>
        <SessionDetail sessionId={selectedSessionId} onBack={() => setSelectedSessionId(null)} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>Kilo Web UI</h1>
      <TaskRunner />
      {loading ? (
        <p>Loading sessions...</p>
      ) : (
        <ul>
          {sessions.map(s => (
            <li 
              key={s.id} 
              onClick={() => setSelectedSessionId(s.id)}
              style={{ 
                cursor: 'pointer', 
                padding: '8px', 
                borderBottom: '1px solid #eee'
              }}
            >
              {s.slug} ({s.projectID})
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App

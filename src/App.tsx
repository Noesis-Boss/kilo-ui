import { useState, useEffect } from 'react'
import { listSessions } from './api/kilo'
import type { Session } from './api/kilo'
import TaskRunner from './components/TaskRunner'

function App() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>Kilo Web UI</h1>
      <TaskRunner />
      {loading ? (
        <p>Loading sessions...</p>
      ) : (
        <ul>
          {sessions.map(s => (
            <li key={s.id}>{s.slug} ({s.projectID})</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App

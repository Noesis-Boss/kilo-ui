import { useState, useEffect } from 'react'
import { listSessions } from '../api/kilo'
import type { Session } from '../api/kilo'

function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1>Sessions</h1>
      {loading ? (
        <p>Loading...</p>
      ) : sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <ul>
          {sessions.map(s => (
            <li key={s.id}>
              <strong>{s.slug}</strong> - {s.projectID} ({s.pattern}, {s.action})
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SessionsPage
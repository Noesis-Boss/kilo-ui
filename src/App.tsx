import { useState, useEffect } from 'react'
import { listSessions, listAgents } from './api/kilo'
import type { Session } from './api/kilo'

function App() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [agents, setAgents] = useState<string[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      listSessions().then(setSessions).catch(() => {}),
      listAgents().then(setAgents).catch(() => {})
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>Kilo Web UI</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <section style={{ marginBottom: 30 }}>
            <h2>Agents</h2>
            {agents.length === 0 ? (
              <p>No agents available</p>
            ) : (
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                style={{ padding: 8, fontSize: 16, minWidth: 200 }}
              >
                <option value="">-- Select an agent --</option>
                {agents.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            )}
            {selectedAgent && (
              <p style={{ marginTop: 10 }}>Selected: <strong>{selectedAgent}</strong></p>
            )}
          </section>

          <section>
            <h2>Sessions</h2>
            {sessions.length === 0 ? (
              <p>No sessions available</p>
            ) : (
              <ul>
                {sessions.map(s => (
                  <li key={s.id}>{s.slug} ({s.projectID})</li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default App

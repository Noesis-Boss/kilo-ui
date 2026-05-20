import { useState, useEffect } from 'react'
import { listAgents } from '../api/kilo'

function AgentsPage() {
  const [agents, setAgents] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listAgents()
      .then(setAgents)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1>Agents</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : agents.length === 0 ? (
        <p>No agents available.</p>
      ) : (
        <ul>
          {agents.map(agent => (
            <li key={agent}>{agent}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AgentsPage
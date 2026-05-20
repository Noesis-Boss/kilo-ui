import { useState, useEffect } from 'react'
import { listSessions, createSession, type Session } from './api/kilo'

function App() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)
  const [slug, setSlug] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch(() => setError('Failed to load sessions'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slug.trim()) {
      setError('Session slug is required')
      return
    }

    setCreateLoading(true)
    setError(null)
    setMessage(null)

    try {
      const newSession = await createSession(slug.trim())
      setSessions(prev => [...prev, newSession])
      setSlug('')
      setMessage('Session created successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>Kilo Web UI</h1>
      
      <form onSubmit={handleCreateSession} style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Enter session slug"
            disabled={createLoading}
            style={{
              padding: 8,
              width: 300,
              marginRight: 10
            }}
          />
          <button
            type="submit"
            disabled={createLoading || !slug.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: createLoading ? '#ccc' : '#007acc',
              color: 'white',
              border: 'none',
              cursor: createLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {createLoading ? 'Creating...' : 'Create Session'}
          </button>
        </div>
      </form>

      {error && (
        <p style={{ color: 'red', marginBottom: 10 }}>{error}</p>
      )}

      {message && (
        <p style={{ color: 'green', marginBottom: 10 }}>{message}</p>
      )}

      {loading ? (
        <p>Loading...</p>
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

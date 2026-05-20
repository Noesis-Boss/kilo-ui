import { useState, useEffect, useCallback } from 'react'
import { listSessions } from './api/kilo'
import type { Session } from './api/kilo'

function App() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listSessions()
      setSessions(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleRefresh = () => {
    if (!loading) fetchSessions()
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Sessions</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          style={{
            padding: '8px 16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            borderRadius: 6,
            border: '1px solid #ccc',
            background: '#f5f5f5',
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fff0f0', color: '#cc0000', padding: 12, borderRadius: 6, marginBottom: 16, border: '1px solid #ffcccc' }}>
          {error}
          <button
            onClick={fetchSessions}
            style={{ marginLeft: 12, padding: '4px 12px', cursor: 'pointer', borderRadius: 4, border: '1px solid #cc0000', background: '#fff' }}
          >
            Retry
          </button>
        </div>
      )}

      {loading && !error && (
        <p style={{ color: '#666' }}>Loading sessions...</p>
      )}

      {!loading && !error && sessions.length === 0 && (
        <p style={{ color: '#666' }}>No sessions found.</p>
      )}

      {!loading && !error && sessions.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.map(s => (
            <li
              key={s.id}
              onClick={() => setSelectedSession(selectedSession?.id === s.id ? null : s)}
              style={{
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: 6,
                cursor: 'pointer',
                background: selectedSession?.id === s.id ? '#e8f0ff' : '#fff',
                transition: 'background 0.15s',
              }}
            >
              <strong>{s.slug}</strong>
              <span style={{ color: '#666', marginLeft: 12 }}>({s.projectID})</span>
              {selectedSession?.id === s.id && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #ccc', fontSize: 14, color: '#333' }}>
                  <div><strong>ID:</strong> {s.id}</div>
                  <div><strong>Project ID:</strong> {s.projectID}</div>
                  <div><strong>Pattern:</strong> {s.pattern}</div>
                  <div><strong>Action:</strong> {s.action}</div>
                  <div><strong>Slug:</strong> {s.slug}</div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App

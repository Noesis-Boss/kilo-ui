import { useState, useEffect, useCallback } from 'react'
import { listSessions, listAgents, runTask } from './api/kilo'
import type { Session } from './api/kilo'

type Tab = 'sessions' | 'taskRunner'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('sessions')

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { key: 'sessions' as Tab, label: 'Sessions' },
          { key: 'taskRunner' as Tab, label: 'Task Runner' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 20px',
              cursor: 'pointer',
              borderRadius: 6,
              border: tab.key === activeTab ? '1px solid #4a6cf7' : '1px solid #ccc',
              background: tab.key === activeTab ? '#4a6cf7' : '#f5f5f5',
              color: tab.key === activeTab ? '#fff' : '#333',
              fontWeight: tab.key === activeTab ? 600 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'sessions' && <SessionsView />}
      {activeTab === 'taskRunner' && <TaskRunnerPage />}
    </div>
  )
}

function SessionsView() {
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
    <div>
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

function TaskRunnerPage() {
  const [agents, setAgents] = useState<string[]>([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [taskInput, setTaskInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [agentsError, setAgentsError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [resultError, setResultError] = useState<string | null>(null)

  useEffect(() => {
    setAgentsLoading(true)
    setAgentsError(null)
    listAgents()
      .then(data => {
        setAgents(data)
        if (data.length > 0) setSelectedAgent(data[0])
      })
      .catch(e => setAgentsError(e instanceof Error ? e.message : 'Failed to load agents'))
      .finally(() => setAgentsLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!selectedAgent || !taskInput.trim()) return
    setLoading(true)
    setResult(null)
    setResultError(null)
    try {
      const data = await runTask(selectedAgent, taskInput)
      setResult(JSON.stringify(data, null, 2))
    } catch (e) {
      setResultError(e instanceof Error ? e.message : 'Task failed')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 24px 0' }}>Task Runner</h1>

      {agentsError && (
        <div style={{ background: '#fff0f0', color: '#cc0000', padding: 12, borderRadius: 6, marginBottom: 16, border: '1px solid #ffcccc' }}>
          {agentsError}
          <button
            onClick={() => listAgents().then(d => setAgents(d)).catch(e => setAgentsError(e.message))}
            style={{ marginLeft: 12, padding: '4px 12px', cursor: 'pointer', borderRadius: 4, border: '1px solid #cc0000', background: '#fff' }}
          >
            Retry
          </button>
        </div>
      )}

      {agentsLoading && (
        <p style={{ color: '#666' }}>Loading agents...</p>
      )}

      {!agentsLoading && !agentsError && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="agent-select" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Agent</label>
            <select
              id="agent-select"
              value={selectedAgent}
              onChange={e => setSelectedAgent(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #ccc',
                fontSize: 14,
                background: '#fff',
                boxSizing: 'border-box',
              }}
            >
              {agents.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-input" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Task Input</label>
            <textarea
              id="task-input"
              value={taskInput}
              onChange={e => setTaskInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Describe the task you want the agent to execute..."
              rows={5}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #ccc',
                fontSize: 14,
                fontFamily: 'system-ui, sans-serif',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Ctrl+Enter to submit</div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !selectedAgent || !taskInput.trim()}
            style={{
              padding: '12px 24px',
              cursor: loading || !selectedAgent || !taskInput.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !selectedAgent || !taskInput.trim() ? 0.6 : 1,
              borderRadius: 6,
              border: 'none',
              background: '#4a6cf7',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              alignSelf: 'flex-start',
            }}
          >
            {loading ? 'Running...' : 'Run Task'}
          </button>

          {resultError && (
            <div style={{ background: '#fff0f0', color: '#cc0000', padding: 12, borderRadius: 6, border: '1px solid #ffcccc' }}>
              {resultError}
            </div>
          )}

          {result && (
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600 }}>Result</h3>
              <pre style={{
                background: '#1e1e2e',
                color: '#cdd6f4',
                padding: 16,
                borderRadius: 6,
                fontSize: 13,
                overflow: 'auto',
                maxHeight: 400,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
              }}>
                {result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
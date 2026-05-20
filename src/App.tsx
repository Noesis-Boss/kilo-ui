import { useState, useEffect, useCallback } from 'react'
import { listSessions, listAgents, runTask, createSession, type Session } from './api/kilo'

type Tab = 'sessions' | 'taskRunner'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('sessions')

  return (
    <div className="app-layout">
      <div className="tabs">
        {[
          { key: 'sessions' as Tab, label: 'Sessions' },
          { key: 'taskRunner' as Tab, label: 'Task Runner' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={tab.key === activeTab ? 'tab-btn tab-btn--active' : 'tab-btn'}
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
  const [createLoading, setCreateLoading] = useState(false)
  const [slug, setSlug] = useState('')
  const [message, setMessage] = useState<string | null>(null)

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
    <div>
      <div className="page-header">
        <h1 className="page-header__title">Sessions</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={loading ? 'btn btn--sm' : 'btn btn--sm'}
        >
          {loading ? 'Refreshing\u2026' : 'Refresh'}
        </button>
      </div>

      <form onSubmit={handleCreateSession} className="form-group">
        <div className="flex gap-3 mb-2">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Enter session slug"
            disabled={createLoading}
            className="form-input"
          />
          <button
            type="submit"
            disabled={createLoading || !slug.trim()}
            className="btn btn--primary"
          >
            {createLoading ? 'Creating\u2026' : 'Create Session'}
          </button>
        </div>
        {message && (
          <span className="text-success">{message}</span>
        )}
      </form>

      {error && (
        <div className="alert alert--danger">
          <span>{error}</span>
          <button onClick={fetchSessions} className="btn btn--sm">
            Retry
          </button>
        </div>
      )}

      {loading && !error && (
        <p className="loading-state">Loading sessions...</p>
      )}

      {!loading && !error && sessions.length === 0 && (
        <p className="text-muted">No sessions found.</p>
      )}

      {!loading && !error && sessions.length > 0 && (
        <ul className="card-list">
          {sessions.map(s => (
            <li
              key={s.id}
              onClick={() => setSelectedSession(selectedSession?.id === s.id ? null : s)}
              className={[
                'card',
                'card--clickable',
                selectedSession?.id === s.id ? 'card--selected' : '',
              ].join(' ')}
            >
              <span>
                <strong>{s.slug}</strong>
                <span className="text-secondary ml-3">({s.projectID})</span>
              </span>
              {selectedSession?.id === s.id && (
                <div className="detail-panel">
                  <div className="detail-panel__row"><strong>ID:</strong> {s.id}</div>
                  <div className="detail-panel__row"><strong>Project ID:</strong> {s.projectID}</div>
                  <div className="detail-panel__row"><strong>Pattern:</strong> {s.pattern}</div>
                  <div className="detail-panel__row"><strong>Action:</strong> {s.action}</div>
                  <div className="detail-panel__row"><strong>Slug:</strong> {s.slug}</div>
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
      <h1 className="page-header__title mb-6">Task Runner</h1>

      {agentsError && (
        <div className="alert alert--danger mb-4">
          <span>{agentsError}</span>
          <button
            onClick={() => listAgents().then(d => setAgents(d)).catch(e => setAgentsError(e.message))}
            className="btn btn--sm"
          >
            Retry
          </button>
        </div>
      )}

      {agentsLoading && (
        <p className="loading-state">Loading agents...</p>
      )}

      {!agentsLoading && !agentsError && (
        <div className="flex flex-col gap-5">
          <div className="form-group">
            <label htmlFor="agent-select" className="form-label">Agent</label>
            <select
              id="agent-select"
              value={selectedAgent}
              onChange={e => setSelectedAgent(e.target.value)}
              disabled={loading}
              className="form-select"
            >
              {agents.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-input" className="form-label">Task Input</label>
            <textarea
              id="task-input"
              value={taskInput}
              onChange={e => setTaskInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Describe the task you want the agent to execute..."
              rows={5}
              className="form-textarea"
            />
            <span className="form-hint">Ctrl+Enter to submit</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !selectedAgent || !taskInput.trim()}
            className="btn btn--primary self-start"
          >
            {loading ? 'Running\u2026' : 'Run Task'}
          </button>

          {resultError && (
            <div className="alert alert--danger">
              {resultError}
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-2">
              <h3>Result</h3>
              <pre className="result-panel code-block">
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

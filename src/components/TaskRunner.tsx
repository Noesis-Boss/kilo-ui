import { useState, useEffect, useCallback } from 'react'
import { listAgents, runTask } from '../api/kilo'

export default function TaskRunner() {
  const [agents, setAgents] = useState<string[]>([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [taskInput, setTaskInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [agentsLoading, setAgentsLoading] = useState(true)

  useEffect(() => {
    listAgents()
      .then(setAgents)
      .catch(() => {})
      .finally(() => setAgentsLoading(false))
  }, [])

  const handleExecute = useCallback(async () => {
    if (!selectedAgent || !taskInput.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const response = await runTask(selectedAgent, taskInput.trim())
      setResult(JSON.stringify(response, null, 2))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [selectedAgent, taskInput])

  const canExecute = selectedAgent && taskInput.trim() && !loading

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h2>Run Agent Task</h2>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="agent-select" style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
          Agent
        </label>
        <select
          id="agent-select"
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          disabled={agentsLoading || loading}
          style={{ width: '100%', padding: 8, fontSize: 14 }}
        >
          <option value="">{agentsLoading ? 'Loading agents...' : 'Select an agent...'}</option>
          {agents.map((agent) => (
            <option key={agent} value={agent}>{agent}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="task-input" style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
          Prompt
        </label>
        <textarea
          id="task-input"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          disabled={loading}
          rows={6}
          placeholder="Describe the task for the agent..."
          style={{ width: '100%', padding: 8, fontSize: 14, fontFamily: 'monospace', resize: 'vertical' }}
        />
      </div>

      <button
        onClick={handleExecute}
        disabled={!canExecute}
        style={{
          padding: '10px 24px',
          fontSize: 16,
          cursor: canExecute ? 'pointer' : 'not-allowed',
          opacity: canExecute ? 1 : 0.5,
          marginBottom: 16,
        }}
      >
        {loading ? 'Executing...' : 'Execute Task'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: 16, padding: 12, border: '1px solid red', borderRadius: 4 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <strong>Result:</strong>
          <pre style={{
            background: '#f4f4f4',
            padding: 12,
            borderRadius: 4,
            overflowX: 'auto',
            fontSize: 13,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {result}
          </pre>
        </div>
      )}
    </div>
  )
}

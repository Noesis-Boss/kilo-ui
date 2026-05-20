import { useState, useEffect } from 'react'
import { listAgents, runTask } from '../api/kilo'

function TaskRunnerPage() {
  const [agents, setAgents] = useState<string[]>([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agentsLoading, setAgentsLoading] = useState(true)

  useEffect(() => {
    listAgents()
      .then(agents => {
        setAgents(agents)
        if (agents.length > 0) setSelectedAgent(agents[0])
      })
      .catch(err => setError(err.message))
      .finally(() => setAgentsLoading(false))
  }, [])

  const handleRunTask = async () => {
    if (!selectedAgent || !input.trim()) return
    
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const res = await runTask(selectedAgent, input)
      setResult(JSON.stringify(res, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Task failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Task Runner</h1>
      
      {agentsLoading ? (
        <p>Loading agents...</p>
      ) : (
        <>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5 }}>Agent:</label>
            <select 
              value={selectedAgent} 
              onChange={(e) => setSelectedAgent(e.target.value)}
              style={{ padding: 5, minWidth: 200 }}
            >
              {agents.map(agent => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5 }}>Task Input:</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: 8 }}
              placeholder="Enter task description..."
            />
          </div>

          <button 
            onClick={handleRunTask} 
            disabled={loading || !selectedAgent || !input.trim()}
            style={{ padding: '8px 16px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Running...' : 'Run Task'}
          </button>

          {error && <p style={{ color: 'red', marginTop: 15 }}>Error: {error}</p>}
          
          {result && (
            <div style={{ marginTop: 15 }}>
              <label>Result:</label>
              <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto' }}>
                {result}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TaskRunnerPage
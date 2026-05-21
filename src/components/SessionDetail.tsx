import { useState, useEffect, useCallback } from 'react'
import { fetchSessionMessages, sendSessionMessage, type Message } from '../api/kilo'

interface SessionDetailProps {
  sessionId: string
  onBack: () => void
}

export default function SessionDetail({ sessionId, onBack }: SessionDetailProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMessages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSessionMessages(sessionId)
      setMessages(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load messages')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const handleSend = useCallback(async () => {
    if (!input.trim()) return
    setSending(true)
    setError(null)
    try {
      const newMessage = await sendSessionMessage(sessionId, input.trim())
      setMessages(prev => [...prev, newMessage])
      setInput('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }, [input, sessionId])

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <h2>Loading messages...</h2>
        <button onClick={onBack} style={{ marginTop: 16 }}>
          Back to Sessions
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Session Detail</h2>
        <button onClick={onBack} style={{ padding: '8px 16px' }}>
          Back to Sessions
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: 16, padding: 12, border: '1px solid red', borderRadius: 4 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ 
        height: 500, 
        overflowY: 'auto', 
        border: '1px solid #ddd', 
        borderRadius: 4, 
        padding: 16, 
        marginBottom: 16,
        backgroundColor: '#fafafa'
      }}>
        {messages.map(msg => (
          <div 
            key={msg.id} 
            style={{ 
              marginBottom: 12, 
              padding: 12, 
              borderRadius: 8,
              maxWidth: '80%',
              backgroundColor: msg.type === 'user' ? '#007bff' : '#28a745',
              color: 'white'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {msg.type === 'user' ? 'You' : 'Agent'}
            </div>
            <div>{msg.content}</div>
            <div style={{ fontSize: '0.8em', opacity: 0.8, marginTop: 4 }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
          rows={3}
          placeholder="Type a message..."
          style={{ 
            flex: 1, 
            padding: 12, 
            fontSize: 14, 
            border: '1px solid #ddd', 
            borderRadius: 4,
            resize: 'none'
          }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          style={{
            padding: '12px 24px',
            fontSize: 14,
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: !sending && input.trim() ? 'pointer' : 'not-allowed',
            opacity: !sending && input.trim() ? 1 : 0.5
          }}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
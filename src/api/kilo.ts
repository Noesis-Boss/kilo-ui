export interface Session {
  id: string
  slug: string
  projectID: string
  pattern: string
  action: string
}

const base = import.meta.env.MODE === 'production' ? '/kilo' : 'https://kilo-jaknyfe.zocomputer.io'

export async function listSessions(): Promise<Session[]> {
  const res = await fetch(`${base}/session`)
  if (!res.ok) throw new Error('Failed to fetch sessions')
  return res.json()
}

export async function listAgents(): Promise<string[]> {
  const res = await fetch(`${base}/agent`)
  if (!res.ok) throw new Error('Failed to fetch agents')
  return res.json()
}

export async function runTask(agent: string, input: any): Promise<any> {
  const res = await fetch(`${base}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent, input })
  })
  if (!res.ok) throw new Error('Task failed')
  return res.json()
}

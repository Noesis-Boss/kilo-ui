export interface Session {
  id: string
  slug: string
  projectID: string
  pattern: string
  action: string
}

export interface Message {
  id: string
  content: string
  type: 'user' | 'agent'
  timestamp: string
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

export async function createSession(slug: string): Promise<Session> {
  const res = await fetch(`${base}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug })
  })
  if (!res.ok) throw new Error('Failed to create session')
  return res.json()
}

export async function fetchSessionMessages(sessionId: string): Promise<Message[]> {
  const res = await fetch(`${base}/session/${sessionId}/messages`)
  if (!res.ok) throw new Error('Failed to fetch messages')
  return res.json()
}

export async function sendSessionMessage(sessionId: string, content: string): Promise<Message> {
  const res = await fetch(`${base}/session/${sessionId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

export interface FileInfo {
  name: string
  path: string
  isDirectory: boolean
  size?: number
  modified?: string
}

export interface FileContent {
  path: string
  content: string
}

export async function listFiles(path: string = '.'): Promise<FileInfo[]> {
  const res = await fetch(`${base}/files?path=${encodeURIComponent(path)}`)
  if (!res.ok) throw new Error('Failed to list files')
  return res.json()
}

export async function readFile(path: string): Promise<FileContent> {
  const res = await fetch(`${base}/files/${encodeURIComponent(path)}`)
  if (!res.ok) throw new Error('Failed to read file')
  return res.json()
}

export async function writeFile(path: string, content: string): Promise<void> {
  const res = await fetch(`${base}/files/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  })
  if (!res.ok) throw new Error('Failed to write file')
}

export async function createDirectory(path: string): Promise<void> {
  const res = await fetch(`${base}/directories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path })
  })
  if (!res.ok) throw new Error('Failed to create directory')
}

export async function deleteFile(path: string): Promise<void> {
  const res = await fetch(`${base}/files/${encodeURIComponent(path)}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Failed to delete file')
}

export async function renameFile(oldPath: string, newPath: string): Promise<void> {
  const res = await fetch(`${base}/files/${encodeURIComponent(oldPath)}/rename`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPath })
  })
  if (!res.ok) throw new Error('Failed to rename file')
}

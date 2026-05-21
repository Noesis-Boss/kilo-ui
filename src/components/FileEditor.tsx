import { useState, useEffect, useCallback } from 'react'
import type { FileInfo } from '../api/kilo'

interface FileEditorProps {
  file: FileInfo
  content: string
  onSave: (content: string) => Promise<void>
  onClose: () => void
}

export default function FileEditor({ file, content: initialContent, onSave, onClose }: FileEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setContent(initialContent)
    setHasChanges(false)
  }, [initialContent])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await onSave(content)
      setHasChanges(false)
    } finally {
      setSaving(false)
    }
  }, [content, onSave])

  const handleClose = useCallback(() => {
    if (hasChanges && !confirm('You have unsaved changes. Close without saving?')) {
      return
    }
    onClose()
  }, [hasChanges, onClose])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ 
        padding: 16, 
        borderBottom: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16 }}>{file.name}</h3>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{file.path}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {hasChanges && <span style={{ color: '#e67e22', fontSize: 12 }}>● Unsaved changes</span>}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            style={{
              padding: '8px 16px',
              cursor: saving || !hasChanges ? 'not-allowed' : 'pointer',
              opacity: saving || !hasChanges ? 0.5 : 1
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleClose}
            style={{
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, padding: 16 }}>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            setHasChanges(true)
          }}
          placeholder="File is empty..."
          style={{
            width: '100%',
            height: '100%',
            padding: 16,
            fontSize: 14,
            fontFamily: 'monospace',
            border: '1px solid #ddd',
            borderRadius: 4,
            resize: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>
    </div>
  )
}
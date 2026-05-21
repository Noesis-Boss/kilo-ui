import { useState, useEffect, useCallback } from 'react'
import { listFiles, readFile, writeFile, createDirectory, deleteFile, renameFile, type FileInfo, type FileContent } from '../api/kilo'
import FileEditor from './FileEditor'

interface FileBrowserProps {
  initialPath?: string
}

export default function FileBrowser({ initialPath = '.' }: FileBrowserProps) {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState(initialPath)
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null)
  const [editingFile, setEditingFile] = useState<FileInfo | null>(null)
  const [showNewDir, setShowNewDir] = useState(false)
  const [newDirName, setNewDirName] = useState('')
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [renamingFile, setRenamingFile] = useState<FileInfo | null>(null)
  const [newFileNameInput, setNewFileNameInput] = useState('')

  const loadFiles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listFiles(currentPath)
      setFiles(data.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load files')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }, [currentPath])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const navigateTo = useCallback((path: string) => {
    setCurrentPath(path)
    setSelectedFile(null)
    setEditingFile(null)
  }, [])

  const navigateUp = useCallback(() => {
    if (currentPath === '.') return
    const parts = currentPath.split('/')
    parts.pop()
    navigateTo(parts.length === 0 ? '.' : parts.join('/'))
  }, [currentPath, navigateTo])

  const handleFileClick = useCallback(async (file: FileInfo) => {
    if (file.isDirectory) {
      navigateTo(file.path)
    } else {
      try {
        const content = await readFile(file.path)
        setSelectedFile(content)
        setEditingFile(file)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to read file')
      }
    }
  }, [navigateTo])

  const handleSaveFile = useCallback(async (content: string) => {
    if (!editingFile) return
    try {
      await writeFile(editingFile.path, content)
      setSelectedFile({ ...selectedFile!, content })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save file')
    }
  }, [editingFile, selectedFile])

  const handleCreateDirectory = useCallback(async () => {
    if (!newDirName.trim()) return
    try {
      await createDirectory(currentPath === '.' ? newDirName : `${currentPath}/${newDirName}`)
      setNewDirName('')
      setShowNewDir(false)
      loadFiles()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create directory')
    }
  }, [newDirName, currentPath, loadFiles])

  const handleCreateFile = useCallback(async () => {
    if (!newFileName.trim()) return
    try {
      const filePath = currentPath === '.' ? newFileName : `${currentPath}/${newFileName}`
      await writeFile(filePath, '')
      setNewFileName('')
      setShowNewFileDialog(false)
      loadFiles()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create file')
    }
  }, [newFileName, currentPath, loadFiles])

  const handleDeleteFile = useCallback(async (file: FileInfo) => {
    if (!confirm(`Delete ${file.name}?`)) return
    try {
      await deleteFile(file.path)
      if (editingFile?.path === file.path) {
        setEditingFile(null)
        setSelectedFile(null)
      }
      loadFiles()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete file')
    }
  }, [editingFile, loadFiles])

  const handleRenameFile = useCallback(async () => {
    if (!renamingFile || !newFileNameInput.trim()) return
    try {
      const newPath = currentPath === '.' ? newFileNameInput : `${currentPath}/${newFileNameInput}`
      await renameFile(renamingFile.path, newPath)
      setRenamingFile(null)
      setNewFileNameInput('')
      loadFiles()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to rename file')
    }
  }, [renamingFile, newFileNameInput, currentPath, loadFiles])

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ 
        width: 350, 
        borderRight: '1px solid #ddd', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#fafafa'
      }}>
        <div style={{ padding: 16, borderBottom: '1px solid #ddd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <button 
              onClick={navigateUp} 
              disabled={currentPath === '.'}
              style={{ 
                padding: '4px 8px', 
                fontSize: 12,
                cursor: currentPath === '.' ? 'not-allowed' : 'pointer',
                opacity: currentPath === '.' ? 0.5 : 1
              }}
            >
              ↑ Up
            </button>
            <span style={{ fontSize: 12, color: '#666', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentPath}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={() => setShowNewDir(true)}
              style={{ 
                flex: 1, 
                padding: '6px 12px', 
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              New Folder
            </button>
            <button 
              onClick={() => setShowNewFileDialog(true)}
              style={{ 
                flex: 1, 
                padding: '6px 12px', 
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              New File
            </button>
          </div>

          {showNewDir && (
            <div style={{ marginTop: 12, padding: 12, border: '1px solid #ccc', borderRadius: 4, backgroundColor: 'white' }}>
              <input
                type="text"
                value={newDirName}
                onChange={(e) => setNewDirName(e.target.value)}
                placeholder="Folder name"
                style={{ width: '100%', padding: 6, marginBottom: 8 }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleCreateDirectory} style={{ flex: 1, padding: '4px 8px' }}>Create</button>
                <button onClick={() => setShowNewDir(false)} style={{ flex: 1, padding: '4px 8px' }}>Cancel</button>
              </div>
            </div>
          )}

          {showNewFileDialog && (
            <div style={{ marginTop: 12, padding: 12, border: '1px solid #ccc', borderRadius: 4, backgroundColor: 'white' }}>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="File name"
                style={{ width: '100%', padding: 6, marginBottom: 8 }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleCreateFile} style={{ flex: 1, padding: '4px 8px' }}>Create</button>
                <button onClick={() => setShowNewFileDialog(false)} style={{ flex: 1, padding: '4px 8px' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {loading ? (
            <p style={{ padding: 16, color: '#666' }}>Loading...</p>
          ) : error ? (
            <p style={{ padding: 16, color: 'red' }}>{error}</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {files.map(file => (
                <li 
                  key={file.path}
                  style={{ 
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: editingFile?.path === file.path ? '#e3f2fd' : 'transparent',
                    fontWeight: editingFile?.path === file.path ? 'bold' : 'normal'
                  }}
                  onClick={() => handleFileClick(file)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    if (confirm(`Rename ${file.name}?`)) {
                      setRenamingFile(file)
                      setNewFileNameInput(file.name)
                    }
                  }}
                >
                  <span style={{ fontSize: 16 }}>{file.isDirectory ? '📁' : '📄'}</span>
                  <span style={{ flex: 1 }}>{file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFile(file)
                    }}
                    style={{
                      padding: '2px 6px',
                      fontSize: 10,
                      cursor: 'pointer',
                      color: 'red',
                      background: 'none',
                      border: 'none'
                    }}
                    title="Delete"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedFile && editingFile ? (
          <FileEditor
            file={editingFile}
            content={selectedFile.content}
            onSave={handleSaveFile}
            onClose={() => {
              setEditingFile(null)
              setSelectedFile(null)
            }}
          />
        ) : (
          <div style={{ padding: 40, color: '#999', textAlign: 'center' }}>
            {editingFile ? 'Loading file...' : 'Select a file to edit'}
          </div>
        )}
      </div>

      {renamingFile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 8,
            minWidth: 300
          }}>
            <h3 style={{ marginTop: 0 }}>Rename File</h3>
            <input
              type="text"
              value={newFileNameInput}
              onChange={(e) => setNewFileNameInput(e.target.value)}
              style={{ width: '100%', padding: 8, marginBottom: 16 }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleRenameFile}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation()
                    e.preventDefault()
                    handleRenameFile()
                  }
                }}
                style={{ flex: 1, padding: '8px 16px' }}
              >Rename</button>
              <button onClick={() => setRenamingFile(null)} style={{ flex: 1, padding: '8px 16px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
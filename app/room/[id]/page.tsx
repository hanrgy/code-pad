'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import CodeEditor from '@/components/CodeEditor'
import UserList from '@/components/UserList'
import AIPanel from '@/components/AIPanel'
import Toast from '@/components/Toast'
import socketManager from '@/lib/socket'

interface User {
  id: string
  name: string
  color: string
  cursor?: { line: number; column: number }
}

export default function RoomPage() {
  const params = useParams()
  const roomId = params.id as string
  const [code, setCode] = useState('')
  const [connectedUsers, setConnectedUsers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Connecting...')
  const [selectedCode, setSelectedCode] = useState<{ start: number; end: number; text: string }>({ start: 0, end: 0, text: '' })
  const [aiSuggestion, setAiSuggestion] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Initialize socket connection
  useEffect(() => {
    const socket = socketManager.connect()
    
    if (socket) {
      setCurrentUserId(socket.id || '')
      
      // Set up event listeners
      socketManager.on('room-state', (data) => {
        console.log('Received room state:', data)
        setCode(data.code)
        setConnectedUsers(data.users)
        setIsConnected(true)
        setConnectionStatus('Connected')
      })

      socketManager.on('user-joined', (user) => {
        console.log('User joined:', user)
        setConnectedUsers(prev => [...prev, user])
        setToast({ message: `${user.name} joined the room`, type: 'info' })
      })

      socketManager.on('user-left', ({ userId, user }) => {
        console.log('User left:', user)
        setConnectedUsers(prev => prev.filter(u => u.id !== userId))
        setToast({ message: `${user.name} left the room`, type: 'info' })
      })

      socketManager.on('code-update', ({ code: newCode, userId }) => {
        console.log('Code update from:', userId)
        setCode(newCode)
      })

      socketManager.on('cursor-update', ({ userId, position, user }) => {
        setConnectedUsers(prev => 
          prev.map(u => 
            u.id === userId 
              ? { ...u, cursor: position }
              : u
          )
        )
      })

      // Join room once connected
      const handleConnect = () => {
        console.log('Socket connected, joining room:', roomId)
        setCurrentUserId(socket.id || '')
        socketManager.joinRoom(roomId, `User${Math.floor(Math.random() * 1000)}`)
      }

      if (socket.connected) {
        handleConnect()
      } else {
        socket.on('connect', handleConnect)
      }

      socket.on('disconnect', () => {
        setIsConnected(false)
        setConnectionStatus('Disconnected')
      })

      socket.on('connect_error', () => {
        setConnectionStatus('Connection Error')
      })
    }

    // Cleanup on unmount
    return () => {
      socketManager.off('room-state')
      socketManager.off('user-joined')
      socketManager.off('user-left')
      socketManager.off('code-update')
      socketManager.off('cursor-update')
      socketManager.disconnect()
    }
  }, [roomId])

  const handleCodeChange = useCallback((newCode: string | undefined) => {
    if (newCode !== undefined && isConnected) {
      setCode(newCode)
      socketManager.sendCodeChange(newCode)
    }
  }, [isConnected])

  const handleCursorChange = useCallback((position: { line: number; column: number }) => {
    if (isConnected) {
      socketManager.sendCursorChange(position)
    }
  }, [isConnected])

  const handleSelectionChange = useCallback((selection: { start: number; end: number; text: string }) => {
    setSelectedCode(selection)
  }, [])

  const handleAIAction = useCallback(async (action: 'fix' | 'refactor' | 'explain' | 'test') => {
    if (!code && !selectedCode.text) {
      setAiError('No code to analyze')
      return
    }

    setAiLoading(true)
    setAiError(null)
    setAiSuggestion(null)

    try {
      const response = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          code: code,
          language: 'javascript',
          selection: selectedCode.text ? {
            start: selectedCode.start,
            end: selectedCode.end
          } : undefined,
          context: roomId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'AI request failed')
      }

      const suggestion = await response.json()
      setAiSuggestion(suggestion)
      setToast({ message: `AI ${action} completed successfully!`, type: 'success' })
      
      // Broadcast AI suggestion to other users in the room (optional)
      // socketManager.sendAISuggestion(suggestion)

    } catch (error) {
      console.error('AI Action Error:', error)
      setAiError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setAiLoading(false)
    }
  }, [code, selectedCode, roomId])

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      setToast({ message: 'Room code copied to clipboard!', type: 'success' })
    } catch (error) {
      setToast({ message: 'Failed to copy room code', type: 'error' })
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Code Pad</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Room:</span>
            <button
              onClick={copyRoomCode}
              className="text-sm font-mono bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border transition-colors"
              title="Click to copy room code"
            >
              {roomId}
            </button>
          </div>
        </div>

        {/* Connection Status & Connected Users */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div 
              className={`w-2 h-2 rounded-full transition-colors ${
                isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'
              }`}
            />
            <span className="text-xs text-gray-500">{connectionStatus}</span>
          </div>
          <UserList users={connectedUsers} currentUserId={currentUserId} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className="flex-1 p-4">
          <div className="h-full">
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              onCursorChange={handleCursorChange}
              onSelectionChange={handleSelectionChange}
              language="javascript"
              theme="vs-dark"
              otherUsers={connectedUsers}
              currentUserId={currentUserId}
            />
          </div>
        </div>

        {/* AI Panel */}
        <AIPanel
          onAIAction={handleAIAction}
          selectedCode={selectedCode.text}
          isLoading={aiLoading}
          suggestion={aiSuggestion}
          error={aiError}
        />
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

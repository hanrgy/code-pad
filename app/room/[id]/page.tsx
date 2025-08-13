'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import CodeEditor from '@/components/CodeEditor'

export default function RoomPage() {
  const params = useParams()
  const roomId = params.id as string
  const [code, setCode] = useState(`// Welcome to Code Pad Room: ${roomId}
// Start typing your code here...

function hello() {
  console.log("Hello, collaborative coding!");
}

// Example buggy function for AI testing:
function calculateSum(a, b) {
  return a + b + 1; // Oops! Bug here
}`)

  const [connectedUsers] = useState([
    { id: '1', name: 'You', color: '#3B82F6' }
  ])

  const handleCodeChange = (newCode: string | undefined) => {
    if (newCode !== undefined) {
      setCode(newCode)
      // TODO: Broadcast to other users via Socket.IO
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId)
    // TODO: Add toast notification
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

        {/* Connected Users */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Connected:</span>
          <div className="flex space-x-1">
            {connectedUsers.map((user) => (
              <div
                key={user.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.name.charAt(0)}
              </div>
            ))}
          </div>
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
              language="javascript"
              theme="vs-dark"
            />
          </div>
        </div>

        {/* AI Panel */}
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant</h3>
          
          <div className="space-y-3">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              🔧 Fix Code
            </button>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              ⚡ Refactor
            </button>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              💡 Explain
            </button>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              🧪 Add Tests
            </button>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">AI Suggestions</h4>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              Select some code and click an AI action to get suggestions!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

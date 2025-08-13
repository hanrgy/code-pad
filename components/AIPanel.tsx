'use client'

import React, { useState } from 'react'

interface AISuggestion {
  suggestion: string
  action: string
  language: string
  timestamp: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface AIPanelProps {
  onAIAction: (action: 'fix' | 'refactor' | 'explain' | 'test') => void
  selectedCode?: string
  isLoading?: boolean
  suggestion?: AISuggestion | null
  error?: string | null
}

const AIPanel: React.FC<AIPanelProps> = ({
  onAIAction,
  selectedCode,
  isLoading = false,
  suggestion,
  error
}) => {
  const [expandedSuggestion, setExpandedSuggestion] = useState(true)

  const handleActionClick = (action: 'fix' | 'refactor' | 'explain' | 'test') => {
    onAIAction(action)
  }

  const formatSuggestion = (text: string) => {
    // Split by code blocks and format appropriately
    const parts = text.split(/```[\w]*\n?/)
    const formatted = []
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text
        if (parts[i].trim()) {
          formatted.push(
            <div key={i} className="mb-3 text-sm text-gray-700 whitespace-pre-wrap">
              {parts[i].trim()}
            </div>
          )
        }
      } else {
        // Code block
        formatted.push(
          <div key={i} className="mb-3">
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
              <code>{parts[i]}</code>
            </pre>
          </div>
        )
      }
    }
    
    return formatted
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'fix': return '🔧'
      case 'refactor': return '⚡'
      case 'explain': return '💡'
      case 'test': return '🧪'
      default: return '🤖'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'fix': return 'bg-green-600 hover:bg-green-700'
      case 'refactor': return 'bg-blue-600 hover:bg-blue-700'
      case 'explain': return 'bg-purple-600 hover:bg-purple-700'
      case 'test': return 'bg-orange-600 hover:bg-orange-700'
      default: return 'bg-gray-600 hover:bg-gray-700'
    }
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant</h3>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {[
            { action: 'fix' as const, label: 'Fix Code', description: 'Debug and fix issues' },
            { action: 'refactor' as const, label: 'Refactor', description: 'Improve code quality' },
            { action: 'explain' as const, label: 'Explain', description: 'Understand the code' },
            { action: 'test' as const, label: 'Add Tests', description: 'Generate unit tests' }
          ].map(({ action, label, description }) => (
            <button
              key={action}
              onClick={() => handleActionClick(action)}
              disabled={isLoading}
              className={`w-full ${getActionColor(action)} text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
              title={description}
            >
              <span>{getActionIcon(action)}</span>
              <span>{label}</span>
              {isLoading && <div className="ml-auto w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            </button>
          ))}
        </div>

        {/* Selection Info */}
        {selectedCode && (
          <div className="mt-4 p-2 bg-blue-50 rounded text-xs">
            <span className="text-blue-600 font-medium">
              {selectedCode.length} characters selected
            </span>
          </div>
        )}
      </div>

      {/* Suggestions Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {isLoading && !suggestion && (
          <div className="p-4 flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-sm text-gray-600">AI is analyzing your code...</div>
          </div>
        )}

        {suggestion && (
          <div className="flex-1 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <span>{getActionIcon(suggestion.action)}</span>
                  <span>AI Suggestion</span>
                </h4>
                <button
                  onClick={() => setExpandedSuggestion(!expandedSuggestion)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {expandedSuggestion ? 'Collapse' : 'Expand'}
                </button>
              </div>
              
              {suggestion.usage && (
                <div className="text-xs text-gray-500 mt-1">
                  Tokens: {suggestion.usage.total_tokens}
                </div>
              )}
            </div>

            {expandedSuggestion && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="prose prose-sm max-w-none">
                  {formatSuggestion(suggestion.suggestion)}
                </div>
              </div>
            )}
          </div>
        )}

        {!suggestion && !isLoading && !error && (
          <div className="p-4 text-center">
            <div className="text-gray-500 text-sm">
              <p className="mb-2">🤖 Select some code and click an AI action to get suggestions!</p>
              <p className="text-xs">
                AI can help you fix bugs, refactor code, explain functionality, or generate tests.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIPanel

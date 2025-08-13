'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import type * as monaco from 'monaco-editor'

interface User {
  id: string
  name: string
  color: string
  cursor?: { line: number; column: number }
}

interface CodeEditorProps {
  value: string
  onChange: (value: string | undefined) => void
  onCursorChange?: (position: { line: number; column: number }) => void
  onSelectionChange?: (selection: { start: number; end: number; text: string }) => void
  language?: string
  theme?: string
  otherUsers?: User[]
  currentUserId?: string
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  onCursorChange,
  onSelectionChange,
  language = 'javascript',
  theme = 'vs-dark',
  otherUsers = [],
  currentUserId
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const decorationsRef = useRef<string[]>([])
  const isUpdatingFromRemote = useRef(false)

  // Update other users' cursors
  const updateCursorDecorations = useCallback(() => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const model = editor.getModel()
    if (!model) return

    // Clear previous decorations
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [])

    // Add decorations for other users' cursors
    const newDecorations: monaco.editor.IModelDeltaDecoration[] = []

    otherUsers.forEach((user) => {
      if (user.cursor && user.id !== currentUserId) {
        const { line, column } = user.cursor
        
        // Ensure the position is valid
        const lineCount = model.getLineCount()
        const validLine = Math.max(1, Math.min(line, lineCount))
        const lineLength = model.getLineLength(validLine)
        const validColumn = Math.max(1, Math.min(column, lineLength + 1))

        // Only create decorations if monaco is available (client-side)
        if (typeof window !== 'undefined') {
          const monacoInstance = (window as any).monaco
          if (monacoInstance) {
            newDecorations.push({
              range: new monacoInstance.Range(validLine, validColumn, validLine, validColumn),
              options: {
                className: 'other-user-cursor',
                afterContentClassName: 'other-user-cursor-after',
                stickiness: monacoInstance.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                hoverMessage: { value: `${user.name}'s cursor` },
                beforeContentClassName: 'other-user-cursor-before',
                glyphMarginClassName: 'other-user-cursor-glyph'
              }
            })
          }
        }
      }
    })

    // Apply new decorations
    decorationsRef.current = editor.deltaDecorations([], newDecorations)
  }, [otherUsers, currentUserId])

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editor
    
    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 14,
      lineHeight: 20,
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderLineHighlight: 'line',
      selectOnLineNumbers: true,
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: 'on',
    })

    // Add cursor change listener
    editor.onDidChangeCursorPosition((e) => {
      if (!isUpdatingFromRemote.current && onCursorChange) {
        onCursorChange({
          line: e.position.lineNumber,
          column: e.position.column
        })
      }
    })

    // Add selection change listener
    editor.onDidChangeCursorSelection((e) => {
      if (!isUpdatingFromRemote.current && onSelectionChange) {
        const model = editor.getModel()
        if (model) {
          const start = model.getOffsetAt(e.selection.getStartPosition())
          const end = model.getOffsetAt(e.selection.getEndPosition())
          const selectedText = model.getValueInRange(e.selection)
          
          if (start !== end) {
            onSelectionChange({
              start,
              end,
              text: selectedText
            })
          } else {
            // No selection, clear selection state
            onSelectionChange({
              start: 0,
              end: 0,
              text: ''
            })
          }
        }
      }
    })

    // Focus the editor
    editor.focus()
  }

  const handleEditorChange = (value: string | undefined) => {
    if (!isUpdatingFromRemote.current) {
      onChange(value)
    }
  }

  // Update value from remote without triggering change event
  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      isUpdatingFromRemote.current = true
      const position = editorRef.current.getPosition()
      editorRef.current.setValue(value)
      if (position) {
        editorRef.current.setPosition(position)
      }
      isUpdatingFromRemote.current = false
    }
  }, [value])

  // Update cursor decorations when other users change
  useEffect(() => {
    updateCursorDecorations()
  }, [updateCursorDecorations])

  return (
    <div className="h-full w-full border border-gray-200 rounded-lg overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        theme={theme}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          padding: { top: 16, bottom: 16 },
          lineNumbers: 'on',
          rulers: [],
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  )
}

export default CodeEditor

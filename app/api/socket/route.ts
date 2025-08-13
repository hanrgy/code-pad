import { NextRequest } from 'next/server'
import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { Socket } from 'socket.io'

// Extend global type for Socket.IO server
declare global {
  var io: SocketIOServer | undefined
}

interface User {
  id: string
  name: string
  color: string
  cursor?: { line: number; column: number }
}

interface RoomData {
  users: Map<string, User>
  code: string
  language: string
}

// In-memory storage for rooms (use Redis in production)
const rooms = new Map<string, RoomData>()

// Generate random color for user
function generateUserColor(): string {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

function initSocket(httpServer: NetServer) {
  const io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id)

    // Join room
    socket.on('join-room', ({ roomId, userName }: { roomId: string, userName?: string }) => {
      console.log(`User ${socket.id} joining room ${roomId}`)
      
      socket.join(roomId)

      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          users: new Map(),
          code: `// Welcome to Code Pad Room: ${roomId}
// Start typing your code here...

function hello() {
  console.log("Hello, collaborative coding!");
}

// Example buggy function for AI testing:
function calculateSum(a, b) {
  return a + b + 1; // Oops! Bug here
}`,
          language: 'javascript'
        })
      }

      const room = rooms.get(roomId)!
      
      // Add user to room
      const user: User = {
        id: socket.id,
        name: userName || `User${Math.floor(Math.random() * 1000)}`,
        color: generateUserColor()
      }
      
      room.users.set(socket.id, user)

      // Send current room state to new user
      socket.emit('room-state', {
        code: room.code,
        language: room.language,
        users: Array.from(room.users.values())
      })

      // Notify other users about new user
      socket.to(roomId).emit('user-joined', user)

      console.log(`Room ${roomId} now has ${room.users.size} users`)
    })

    // Handle code changes
    socket.on('code-change', ({ roomId, code, delta }: { 
      roomId: string, 
      code: string, 
      delta?: any 
    }) => {
      const room = rooms.get(roomId)
      if (room) {
        room.code = code
        // Broadcast to all other users in the room
        socket.to(roomId).emit('code-update', { code, delta, userId: socket.id })
      }
    })

    // Handle cursor position changes
    socket.on('cursor-change', ({ roomId, position }: {
      roomId: string,
      position: { line: number; column: number }
    }) => {
      const room = rooms.get(roomId)
      if (room && room.users.has(socket.id)) {
        const user = room.users.get(socket.id)!
        user.cursor = position
        
        // Broadcast cursor position to other users
        socket.to(roomId).emit('cursor-update', {
          userId: socket.id,
          position,
          user
        })
      }
    })

    // Handle language change
    socket.on('language-change', ({ roomId, language }: {
      roomId: string,
      language: string
    }) => {
      const room = rooms.get(roomId)
      if (room) {
        room.language = language
        socket.to(roomId).emit('language-update', { language })
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
      
      // Remove user from all rooms
      for (const [roomId, room] of rooms.entries()) {
        if (room.users.has(socket.id)) {
          const user = room.users.get(socket.id)!
          room.users.delete(socket.id)
          
          // Notify other users
          socket.to(roomId).emit('user-left', { userId: socket.id, user })
          
          // Clean up empty rooms
          if (room.users.size === 0) {
            rooms.delete(roomId)
            console.log(`Room ${roomId} deleted (empty)`)
          }
        }
      }
    })
  })

  global.io = io
  return io
}

export async function GET() {
  console.log('Socket.IO GET request - WebSocket upgrade should follow')
  return new Response('Socket.IO server is running', { status: 200 })
}

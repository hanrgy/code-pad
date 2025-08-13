const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

// Room and user management
const rooms = new Map()

function generateUserColor() {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handler(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: {
      origin: dev ? 'http://localhost:3000' : false,
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-room', ({ roomId, userName }) => {
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

      const room = rooms.get(roomId)
      
      // Add user to room
      const user = {
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
    socket.on('code-change', ({ roomId, code, delta }) => {
      const room = rooms.get(roomId)
      if (room) {
        room.code = code
        // Broadcast to all other users in the room
        socket.to(roomId).emit('code-update', { 
          code, 
          delta, 
          userId: socket.id 
        })
      }
    })

    // Handle cursor position changes
    socket.on('cursor-change', ({ roomId, position }) => {
      const room = rooms.get(roomId)
      if (room && room.users.has(socket.id)) {
        const user = room.users.get(socket.id)
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
    socket.on('language-change', ({ roomId, language }) => {
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
          const user = room.users.get(socket.id)
          room.users.delete(socket.id)
          
          // Notify other users
          socket.to(roomId).emit('user-left', { 
            userId: socket.id, 
            user 
          })
          
          // Clean up empty rooms
          if (room.users.size === 0) {
            rooms.delete(roomId)
            console.log(`Room ${roomId} deleted (empty)`)
          }
        }
      }
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})

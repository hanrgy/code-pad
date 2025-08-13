import { io, Socket } from 'socket.io-client'

interface User {
  id: string
  name: string
  color: string
  cursor?: { line: number; column: number }
}

interface RoomState {
  code: string
  language: string
  users: User[]
}

interface SocketEvents {
  'room-state': (data: RoomState) => void
  'user-joined': (user: User) => void
  'user-left': (data: { userId: string; user: User }) => void
  'code-update': (data: { code: string; delta?: any; userId: string }) => void
  'cursor-update': (data: { userId: string; position: { line: number; column: number }; user: User }) => void
  'language-update': (data: { language: string }) => void
}

class SocketManager {
  private socket: Socket | null = null
  private roomId: string | null = null
  private callbacks: Partial<SocketEvents> = {}

  connect() {
    if (this.socket?.connected) return this.socket

    this.socket = io({
      path: '/socket.io',
      autoConnect: true,
    })

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server:', this.socket?.id)
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error)
    })

    // Set up event listeners
    this.socket.on('room-state', (data: RoomState) => {
      this.callbacks['room-state']?.(data)
    })

    this.socket.on('user-joined', (user: User) => {
      this.callbacks['user-joined']?.(user)
    })

    this.socket.on('user-left', (data: { userId: string; user: User }) => {
      this.callbacks['user-left']?.(data)
    })

    this.socket.on('code-update', (data: { code: string; delta?: any; userId: string }) => {
      this.callbacks['code-update']?.(data)
    })

    this.socket.on('cursor-update', (data: { userId: string; position: { line: number; column: number }; user: User }) => {
      this.callbacks['cursor-update']?.(data)
    })

    this.socket.on('language-update', (data: { language: string }) => {
      this.callbacks['language-update']?.(data)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.roomId = null
    }
  }

  joinRoom(roomId: string, userName?: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected')
      return
    }

    this.roomId = roomId
    this.socket.emit('join-room', { roomId, userName })
  }

  sendCodeChange(code: string, delta?: any) {
    if (!this.socket?.connected || !this.roomId) {
      console.error('Socket not connected or no room joined')
      return
    }

    this.socket.emit('code-change', { 
      roomId: this.roomId, 
      code, 
      delta 
    })
  }

  sendCursorChange(position: { line: number; column: number }) {
    if (!this.socket?.connected || !this.roomId) {
      return
    }

    this.socket.emit('cursor-change', { 
      roomId: this.roomId, 
      position 
    })
  }

  sendLanguageChange(language: string) {
    if (!this.socket?.connected || !this.roomId) {
      console.error('Socket not connected or no room joined')
      return
    }

    this.socket.emit('language-change', { 
      roomId: this.roomId, 
      language 
    })
  }

  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
    this.callbacks[event] = callback
  }

  off<K extends keyof SocketEvents>(event: K) {
    delete this.callbacks[event]
  }

  isConnected() {
    return this.socket?.connected || false
  }

  getCurrentRoom() {
    return this.roomId
  }
}

// Singleton instance
export const socketManager = new SocketManager()
export default socketManager

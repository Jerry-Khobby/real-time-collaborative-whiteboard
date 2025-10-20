"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"

interface DrawEvent {
  x: number
  y: number
  prevX: number
  prevY: number
  color: string
  brushSize: number
}

interface PresenceUser {
  id: string
  color: string
}

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  users: PresenceUser[]
  emitDraw: (data: DrawEvent) => void
  emitClear: () => void
  onDraw: (callback: (data: DrawEvent) => void) => () => void
  onClear: (callback: () => void) => () => void
  onCanvasState: (callback: (state: DrawEvent[]) => void) => () => void
}

const SocketContext = createContext<SocketContextType | null>(null)

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider")
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
  canvasId: string
}

export function SocketProvider({ children, canvasId }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [users, setUsers] = useState<PresenceUser[]>([])

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
    const socketInstance = io(socketUrl, {
      transports: ["websocket"],
    })

    socketInstance.on("connect", () => {
      console.log("[v0] Socket connected")
      setIsConnected(true)
      socketInstance.emit("join-canvas", { canvasId })
    })

    socketInstance.on("disconnect", () => {
      console.log("[v0] Socket disconnected")
      setIsConnected(false)
    })

    socketInstance.on("presence-update", (data: { users: PresenceUser[] }) => {
      console.log("[v0] Presence update:", data.users)
      setUsers(data.users)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [canvasId])

  const emitDraw = (data: DrawEvent) => {
    if (socket && isConnected) {
      socket.emit("draw", { canvasId, ...data })
    }
  }

  const emitClear = () => {
    console.log("[v0] Emitting clear-canvas event")
    if (socket && isConnected) {
      socket.emit("clear-canvas", { canvasId })
    } else {
      console.log("[v0] Cannot emit clear - socket not connected")
    }
  }

  const onDraw = (callback: (data: DrawEvent) => void) => {
    if (socket) {
      socket.on("draw", callback)
      return () => {
        socket.off("draw", callback)
      }
    }
    return () => {}
  }

  const onClear = (callback: () => void) => {
    if (socket) {
      console.log("[v0] Setting up clear-canvas listener")
      socket.on("clear-canvas", callback)
      return () => {
        socket.off("clear-canvas", callback)
      }
    }
    return () => {}
  }

  const onCanvasState = (callback: (state: DrawEvent[]) => void) => {
    if (socket) {
      socket.on("canvas-state", callback)
      return () => {
        socket.off("canvas-state", callback)
      }
    }
    return () => {}
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        users,
        emitDraw,
        emitClear,
        onDraw,
        onClear,
        onCanvasState,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

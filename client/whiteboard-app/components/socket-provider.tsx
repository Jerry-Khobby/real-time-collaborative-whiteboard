"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

interface DrawEvent {
  points: { x: number; y: number }[];
  color: string;
  brushSize: number;
  strokeId?: string;
  userId?: string;
}

interface PresenceUser {
  id: string;
  color: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  users: PresenceUser[];
  emitDraw: (data: DrawEvent) => void;
  emitClear: () => void;
  leaveCanvas: () => void;
  onDraw: (callback: (data: DrawEvent) => void) => () => void;
  onClear: (callback: () => void) => () => void;
  onUserJoin: (callback: (data: any) => void) => () => void;
  onUserLeave: (callback: (data: any) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
}

interface SocketProviderProps {
  children: ReactNode;
  canvasId: string;
}

export function SocketProvider({ children, canvasId }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const socketUrl = "http://localhost:5000";
    const socketInstance = io(socketUrl, {
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      console.log("[socket] Connected:", socketInstance.id);
      setIsConnected(true);
      socketInstance.emit("join-canvas", { canvasId });
    });

    socketInstance.on("disconnect", () => {
      console.log("[socket] Disconnected");
      setIsConnected(false);
    });

    socketInstance.on("joined-canvas", (data) => {
      console.log("[socket] Joined canvas:", data);
    });

    socketInstance.on("user-joined", (data) => {
      console.log("[socket] User joined:", data);
    });

    socketInstance.on("user-left", (data) => {
      console.log("[socket] User left:", data);
    });

    socketInstance.on("error", (err) => {
      console.error("[socket] Error:", err);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [canvasId]);

  // === Emit events ===
  const emitDraw = (data: DrawEvent) => {
    if (socket && isConnected) {
      socket.emit("draw", { canvasId, ...data });
    }
  };

  const emitClear = () => {
    if (socket && isConnected) {
      socket.emit("clear", { canvasId });
    }
  };

  const leaveCanvas = () => {
    if (socket && isConnected) {
      socket.emit("leave-canvas", { canvasId });
    }
  };

  // === Listen for events ===
  const onDraw = (callback: (data: DrawEvent) => void) => {
    if (socket) {
      socket.on("drawing-data", callback);
      return () => socket.off("drawing-data", callback);
    }
    return () => {};
  };

  const onClear = (callback: () => void) => {
    if (socket) {
      socket.on("canvas-cleared", callback);
      return () => socket.off("canvas-cleared", callback);
    }
    return () => {};
  };

  const onUserJoin = (callback: (data: any) => void) => {
    if (socket) {
      socket.on("user-joined", callback);
      return () => socket.off("user-joined", callback);
    }
    return () => {};
  };

  const onUserLeave = (callback: (data: any) => void) => {
    if (socket) {
      socket.on("user-left", callback);
      return () => socket.off("user-left", callback);
    }
    return () => {};
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        users,
        emitDraw,
        emitClear,
        leaveCanvas,
        onDraw,
        onClear,
        onUserJoin,
        onUserLeave,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

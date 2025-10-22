"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import toast from "react-hot-toast";

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

    // ✅ Connection
    socketInstance.on("connect", () => {
      console.log("[socket] Connected:", socketInstance.id);
      setIsConnected(true);
      socketInstance.emit("join-canvas", { canvasId });
    });

    socketInstance.on("disconnect", () => {
      console.log("[socket] Disconnected");
      setIsConnected(false);
    });

    // ✅ Joined successfully (self)
    socketInstance.on("joined-canvas", (data) => {
      toast.success(`You joined canvas: ${data.canvasId}`);
      console.log("[socket] Joined canvas:", data);
    });

    // ✅ Another user joined
    socketInstance.on("user-joined", (data) => {
      toast.success(`👤 User joined: ${data.userId}`);
      console.log("[socket] User joined:", data);
    });

    // ✅ User left
    socketInstance.on("user-left", (data) => {
      toast(`👋 User left: ${data.userId}`, { icon: "🚪" });
      console.log("[socket] User left:", data);
    });

    // ✅ Someone cleared canvas
    socketInstance.on("canvas-cleared", (data) => {
      toast("🧹 Canvas cleared!", { icon: "🧽" });
      console.log("[socket] Canvas cleared:", data);
    });

    // ✅ Drawing data (from others)
    socketInstance.on("drawing-data", (data) => {});

    socketInstance.on("error", (err) => {
      console.error("[socket] Error:", err);
      toast.error(err.message || "Socket error occurred");
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

  // === Event listener helpers ===
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

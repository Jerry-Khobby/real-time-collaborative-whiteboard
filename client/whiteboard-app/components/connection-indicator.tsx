"use client"

import { useSocket } from "./socket-provider"

export function ConnectionIndicator() {
  const { isConnected } = useSocket()

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass shadow-md">
      <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} shadow-sm`} />
      <span className="text-sm font-medium text-foreground">{isConnected ? "Connected" : "Disconnected"}</span>
    </div>
  )
}

"use client"

import { useSocket } from "./socket-provider"
import { Users } from "lucide-react"

export function PresenceList() {
  const { users } = useSocket()

  return (
    <div className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl glass shadow-md">
      <Users className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground shrink-0" />
      <div className="flex items-center gap-1 md:gap-2">
        {users.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white shadow-sm shrink-0"
            style={{ backgroundColor: user.color }}
            title={user.id}
          />
        ))}
        {users.length > 3 && (
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white shadow-sm bg-gray-400 flex items-center justify-center shrink-0">
            <span className="text-[10px] md:text-xs font-bold text-white">+{users.length - 3}</span>
          </div>
        )}
        <span className="text-xs md:text-sm font-medium text-foreground ml-1 whitespace-nowrap">{users.length}</span>
      </div>
    </div>
  )
}

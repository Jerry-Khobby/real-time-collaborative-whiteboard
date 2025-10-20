"use client"

import { useState, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { SocketProvider, useSocket } from "@/components/socket-provider"
import { CanvasBoard, type CanvasBoardRef } from "@/components/canvas-board"
import { Toolbar } from "@/components/toolbar"
import { ConnectionIndicator } from "@/components/connection-indicator"
import { PresenceList } from "@/components/presence-list"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Menu, X } from "lucide-react"

function CanvasPageContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const canvasId = params.id as string
  const canvasName = searchParams.get("name") || "Untitled Canvas"
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [showToolbar, setShowToolbar] = useState(false)
  const { emitClear } = useSocket()
  const canvasBoardRef = useRef<CanvasBoardRef>(null)

  const handleClear = () => {
    console.log("[v0] Clear button clicked")
    canvasBoardRef.current?.clearCanvas()
    emitClear()
  }

  const handleExport = () => {
    const canvas = document.querySelector("canvas")
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `whiteboard-${canvasId}-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      <header className="flex items-center justify-between p-3 md:p-4 glass-dark shadow-md shrink-0">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-foreground hover:bg-white/50 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm md:text-lg font-bold text-foreground truncate">{canvasName}</h1>
            <p className="text-xs text-muted-foreground font-mono truncate">ID: {canvasId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-3">
            <PresenceList />
            <ConnectionIndicator />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowToolbar(!showToolbar)}
            className="lg:hidden text-foreground hover:bg-white/50"
          >
            {showToolbar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <div
        className={`lg:hidden flex items-center justify-between p-2 glass-dark shrink-0 ${showToolbar ? "hidden" : "flex"}`}
      >
        <PresenceList />
        <ConnectionIndicator />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 md:p-4 gap-2 md:gap-4 min-h-0">
        <aside
          className={`${
            showToolbar ? "translate-y-0" : "translate-y-full"
          } lg:translate-y-0 fixed lg:relative bottom-0 left-0 right-0 lg:w-72 z-20 transition-transform duration-300 ease-in-out lg:block shrink-0`}
        >
          <div className="max-h-[70vh] lg:max-h-full overflow-y-auto">
            <Toolbar
              color={color}
              brushSize={brushSize}
              onColorChange={setColor}
              onBrushSizeChange={setBrushSize}
              onClear={handleClear}
              onExport={handleExport}
            />
          </div>
        </aside>

        {showToolbar && (
          <div
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
            onClick={() => setShowToolbar(false)}
          />
        )}

        <main className="flex-1 relative rounded-xl overflow-hidden shadow-2xl min-h-0 min-w-0">
          <CanvasBoard ref={canvasBoardRef} color={color} brushSize={brushSize} />
        </main>
      </div>
    </div>
  )
}

export default function CanvasPage() {
  const params = useParams()
  const canvasId = params.id as string

  return (
    <SocketProvider canvasId={canvasId}>
      <CanvasPageContent />
    </SocketProvider>
  )
}

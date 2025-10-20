"use client"

import type React from "react"

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react"
import { useSocket } from "./socket-provider"

interface CanvasBoardProps {
  color: string
  brushSize: number
}

interface DrawEvent {
  x: number
  y: number
  prevX: number
  prevY: number
  color: string
  brushSize: number
}

export interface CanvasBoardRef {
  clearCanvas: () => void
}

export const CanvasBoard = forwardRef<CanvasBoardRef, CanvasBoardProps>(({ color, brushSize }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  const [isReady, setIsReady] = useState(false)
  const { emitDraw, onDraw, onClear, onCanvasState } = useSocket()

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    console.log("[v0] Clearing canvas")
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  useImperativeHandle(ref, () => ({
    clearCanvas,
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const initCanvas = () => {
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) return

      // Set canvas size to match container
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      // Initialize with white background
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Mark as ready
      setIsReady(true)
      console.log("[v0] Canvas initialized and ready", canvas.width, canvas.height)
    }

    // Initialize immediately
    initCanvas()

    const resizeCanvas = () => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Save current canvas content
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Get new dimensions
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      // Fill with white
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Restore canvas content
      ctx.putImageData(imageData, 0, 0)
    }

    window.addEventListener("resize", resizeCanvas)

    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  useEffect(() => {
    if (!isReady) return

    const cleanupDraw = onDraw((data: DrawEvent) => {
      drawLine(data.prevX, data.prevY, data.x, data.y, data.color, data.brushSize)
    })

    const cleanupClear = onClear(() => {
      console.log("[v0] Received clear-canvas event")
      clearCanvas()
    })

    const cleanupCanvasState = onCanvasState((state: DrawEvent[]) => {
      console.log("[v0] Received canvas state with", state.length, "events")
      clearCanvas()
      state.forEach((event) => {
        drawLine(event.prevX, event.prevY, event.x, event.y, event.color, event.brushSize)
      })
    })

    return () => {
      cleanupDraw()
      cleanupClear()
      cleanupCanvasState()
    }
  }, [onDraw, onClear, onCanvasState, isReady])

  const drawLine = (x1: number, y1: number, x2: number, y2: number, strokeColor: string, strokeSize: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
  }

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDrawing(true)
    const pos = getCoordinates(e)
    setLastPos(pos)
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()

    const pos = getCoordinates(e)

    drawLine(lastPos.x, lastPos.y, pos.x, pos.y, color, brushSize)

    emitDraw({
      x: pos.x,
      y: pos.y,
      prevX: lastPos.x,
      prevY: lastPos.y,
      color,
      brushSize,
    })

    setLastPos(pos)
  }

  const handleEnd = () => {
    setIsDrawing(false)
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="w-full h-full touch-none cursor-crosshair bg-white rounded-lg shadow-inner"
        style={{ imageRendering: "auto" }}
      />
    </div>
  )
})

CanvasBoard.displayName = "CanvasBoard"

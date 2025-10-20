"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()
  const [canvasName, setCanvasName] = useState("")
  const [canvasId, setCanvasId] = useState("")

  const createNewCanvas = () => {
    if (canvasName.trim()) {
      const newId = Math.random().toString(36).substring(2, 15)
      router.push(`/canvas/${newId}?name=${encodeURIComponent(canvasName.trim())}`)
    }
  }

  const joinCanvas = () => {
    if (canvasId.trim()) {
      router.push(`/canvas/${canvasId}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance">Collaborative Whiteboard</h1>
          <p className="text-lg text-muted-foreground text-balance">
            Create and share ideas in real-time with your team. Draw together, anywhere.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">Create New Canvas</CardTitle>
              <CardDescription>Start a fresh whiteboard and invite others to collaborate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter canvas name"
                value={canvasName}
                onChange={(e) => setCanvasName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createNewCanvas()}
                className="bg-secondary border-border text-foreground"
              />
              <Button
                onClick={createNewCanvas}
                disabled={!canvasName.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                Create Canvas
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">Join Existing Canvas</CardTitle>
              <CardDescription>Enter a canvas ID to join an ongoing session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter canvas ID"
                value={canvasId}
                onChange={(e) => setCanvasId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinCanvas()}
                className="bg-secondary border-border text-foreground"
              />
              <Button onClick={joinCanvas} disabled={!canvasId.trim()} className="w-full" variant="secondary" size="lg">
                Join Canvas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

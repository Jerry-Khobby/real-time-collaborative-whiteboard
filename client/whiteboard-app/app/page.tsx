"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();
  const [canvasName, setCanvasName] = useState("");
  const [canvasId, setCanvasId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // <-- track errors

  // Create new canvas
  const createNewCanvas = async () => {
    setError(""); // clear any previous errors
    if (!canvasName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: canvasName.trim(), drawingData: [] }),
      });

      const data = await res.json();

      if (!res.ok) {
        // show backend message
        setError(data.message || "Failed to create canvas. Please try again.");
        return;
      }
      setCanvasName(data.data.name || "");

      if (data.data?.canvasId) {
        router.push(
          `/canvas/${data.data.canvasId}?name=${encodeURIComponent(
            canvasName.trim()
          )}`
        );
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Join canvas
  const joinCanvas = async () => {
    setError("");
    if (!canvasId.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/canvas/${canvasId.trim()}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Canvas not found.");
        return;
      }

      setCanvasId(data.canvas.canvasId || "");
      setCanvasName(data.canvas.name || "");

      router.push(
        `/canvas/${canvasId}?name=${encodeURIComponent(canvasName.trim())}`
      );
    } catch (err) {
      console.error(err);
      setError("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Collaborative Whiteboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Create and share ideas in real-time with your team.
          </p>
        </div>

        {/* 🧱 Error message display */}
        {error && (
          <div className="mb-6 text-center text-red-500 font-medium bg-red-100 border border-red-300 rounded-lg p-2">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Canvas</CardTitle>
              <CardDescription>
                Start a fresh whiteboard session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter canvas name"
                value={canvasName}
                onChange={(e) => setCanvasName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createNewCanvas()}
              />
              <Button
                onClick={createNewCanvas}
                disabled={!canvasName.trim() || loading}
                className="w-full"
              >
                {loading ? "Creating..." : "Create Canvas"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join Existing Canvas</CardTitle>
              <CardDescription>
                Enter a canvas ID to join an ongoing session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter canvas ID"
                value={canvasId}
                onChange={(e) => setCanvasId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinCanvas()}
              />
              <Button
                onClick={joinCanvas}
                disabled={!canvasId.trim() || loading}
                className="w-full"
                variant="secondary"
              >
                {loading ? "Joining..." : "Join Canvas"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

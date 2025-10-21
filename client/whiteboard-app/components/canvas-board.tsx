"use client";

import type React from "react";
import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useSocket } from "./socket-provider";

interface CanvasBoardProps {
  color: string;
  brushSize: number;
}

interface DrawEvent {
  points: { x: number; y: number }[];
  color: string;
  brushSize: number;
}

export interface CanvasBoardRef {
  clearCanvas: () => void;
}

export const CanvasBoard = forwardRef<CanvasBoardRef, CanvasBoardProps>(
  ({ color, brushSize }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
    const [isReady, setIsReady] = useState(false);
    const { emitDraw, onDraw, onClear } = useSocket();

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    useImperativeHandle(ref, () => ({ clearCanvas }));

    // ✅ Initialize Canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const initCanvas = () => {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setIsReady(true);
      };

      initCanvas();

      const resizeCanvas = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
      };

      window.addEventListener("resize", resizeCanvas);
      return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    // ✅ Listen for drawing & clearing
    useEffect(() => {
      if (!isReady) return;

      const cleanupDraw = onDraw((data: DrawEvent) => {
        const pts = data.points;
        if (pts.length >= 2) {
          drawLine(pts[0].x, pts[0].y, pts[1].x, pts[1].y, data.color, data.brushSize);
        }
      });

      const cleanupClear = onClear(() => {
        clearCanvas();
      });

      return () => {
        cleanupDraw();
        cleanupClear();
      };
    }, [onDraw, onClear, isReady]);

    // ✅ Draw line
    const drawLine = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      strokeColor: string,
      strokeSize: number
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    };

    // ✅ Mouse/touch handlers
    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();

      if ("touches" in e) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      }
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      setLastPos(getCoordinates(e));
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();

      const pos = getCoordinates(e);
      drawLine(lastPos.x, lastPos.y, pos.x, pos.y, color, brushSize);

      emitDraw({
        points: [
          { x: lastPos.x, y: lastPos.y },
          { x: pos.x, y: pos.y },
        ],
        color,
        brushSize,
      });

      setLastPos(pos);
    };

    const handleEnd = () => setIsDrawing(false);

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
        />
      </div>
    );
  }
);

CanvasBoard.displayName = "CanvasBoard";

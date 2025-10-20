"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Download, Trash2 } from "lucide-react"

interface ToolbarProps {
  color: string
  brushSize: number
  onColorChange: (color: string) => void
  onBrushSizeChange: (size: number) => void
  onClear: () => void
  onExport: () => void
}

const COLORS = [
  "#000000", // Black
  "#FF6B6B", // Red
  "#4ECDC4", // Cyan
  "#45B7D1", // Blue
  "#FFE66D", // Yellow
  "#A8E6CF", // Mint
  "#FF8B94", // Pink
  "#9B59B6", // Purple
]

export function Toolbar({ color, brushSize, onColorChange, onBrushSizeChange, onClear, onExport }: ToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:gap-4 p-3 md:p-4 glass rounded-t-xl lg:rounded-xl shadow-lg m-2 lg:m-0">
      <div>
        <label className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3 block">Color</label>
        <div className="grid grid-cols-8 lg:grid-cols-4 gap-1.5 md:gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 transition-all shadow-sm ${
                color === c
                  ? "border-primary scale-110 shadow-md ring-2 ring-primary/50"
                  : "border-gray-300 hover:scale-105"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3 block">
          Brush Size: {brushSize}px
        </label>
        <Slider
          value={[brushSize]}
          onValueChange={(values) => onBrushSizeChange(values[0])}
          min={1}
          max={50}
          step={1}
          className="w-full"
        />
      </div>

      <div className="flex flex-row lg:flex-col gap-2 pt-2 border-t border-gray-200">
        <Button onClick={onClear} variant="destructive" className="flex-1 lg:w-full" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>
        <Button onClick={onExport} variant="secondary" className="flex-1 lg:w-full" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}

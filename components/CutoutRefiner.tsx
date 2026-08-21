'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wand2,
  RotateCcw,
  Check,
  X,
  Undo,
} from 'lucide-react';

interface CutoutRefinerProps {
  initialImage: string; // Base64 or Blob URL of current cutout
  originalImage?: string; // Optional original un-cut photo
  onApply: (newBase64: string) => void;
  onClose: () => void;
  accentColor?: string;
}

export default function CutoutRefiner({
  initialImage,
  originalImage,
  onApply,
  onClose,
  accentColor = '#2563eb',
}: CutoutRefinerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [tolerance, setTolerance] = useState(30);
  const [mode, setMode] = useState<'magic-erase' | 'magic-restore'>('magic-erase');
  const [hasChanges, setHasChanges] = useState(false);
  const isDragging = useRef(false);
  const dragSnapshotRef = useRef<ImageData | null>(null);

  // Initialize canvas with initial image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = initialImage;
    img.onload = () => {
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialData]);
    };
  }, [initialImage]);

  // Helper: flood-fill erase/restore from a point (without saving to history)
  const floodFillAt = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    px: number,
    py: number,
    tol: number
  ) => {
    const imgData = ctx.getImageData(0, 0, w, h);
    const { data } = imgData;
    const targetIdx = (py * w + px) * 4;
    const targetR = data[targetIdx];
    const targetG = data[targetIdx + 1];
    const targetB = data[targetIdx + 2];

    const visited = new Uint8Array(w * h);
    const queue: [number, number][] = [[px, py]];

    while (queue.length > 0) {
      const [x, y] = queue.pop()!;
      const idx = (y * w + x) * 4;
      const pixelPos = y * w + x;
      if (visited[pixelPos]) continue;
      visited[pixelPos] = 1;

      const dist = Math.hypot(data[idx] - targetR, data[idx + 1] - targetG, data[idx + 2] - targetB);
      if (dist <= tol) {
        data[idx + 3] = mode === 'magic-erase' ? 0 : 255;
        if (x > 0 && !visited[pixelPos - 1]) queue.push([x - 1, y]);
        if (x < w - 1 && !visited[pixelPos + 1]) queue.push([x + 1, y]);
        if (y > 0 && !visited[pixelPos - w]) queue.push([x, y - 1]);
        if (y < h - 1 && !visited[pixelPos + w]) queue.push([x, y + 1]);
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };

  // Get canvas pixel position from pointer/touch client coords
  const getCanvasPos = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.floor(((clientX - rect.left) / rect.width) * canvas.width),
      y: Math.floor(((clientY - rect.top) / rect.height) * canvas.height),
    };
  };

  // ── POINTER DOWN: start drag, save snapshot ──
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    isDragging.current = true;
    // Save snapshot before drag starts (for undo)
    dragSnapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const { x, y } = getCanvasPos(canvas, e.clientX, e.clientY);
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;
    floodFillAt(ctx, canvas.width, canvas.height, x, y, tolerance);
    setHasChanges(true);
  };

  // ── POINTER MOVE: continuous erase while dragging ──
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { x, y } = getCanvasPos(canvas, e.clientX, e.clientY);
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;
    floodFillAt(ctx, canvas.width, canvas.height, x, y, tolerance);
  };

  // ── POINTER UP: end drag, save to history ──
  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const canvas = canvasRef.current;
    if (!canvas || !dragSnapshotRef.current) return;

    setHistory((prev) => [...prev, dragSnapshotRef.current!]);
    dragSnapshotRef.current = null;
  };

  // Undo last refinement step
  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = history[history.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory((prev) => prev.slice(0, -1));
  };

  // Reset to original cutout
  const handleReset = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const firstState = history[0];
    ctx.putImageData(firstState, 0, 0);
    setHistory([firstState]);
    setHasChanges(false);
  };

  // Apply and export refined PNG
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL('image/png');
    onApply(base64);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden touch-none select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="liquid-glass rounded-[2rem] max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-white/20 dark:border-white/10 flex flex-col max-h-[92vh] max-h-[92dvh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold tracking-tight">Magic Cutout Refiner</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 liquid-control rounded-full hover:opacity-70 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tip */}
        <p className="text-[11px] font-mono text-center opacity-60">
          Tap or drag your finger to erase background areas. Drag for fast erasing.
        </p>

        {/* Canvas Display with Checkerboard Transparency Background */}
        <div className="flex-1 min-h-[220px] max-h-[360px] rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 flex items-center justify-center relative bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] dark:bg-[repeating-conic-gradient(#1f2937_0%_25%,#111827_0%_50%)]">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="max-w-full max-h-full object-contain cursor-crosshair touch-none"
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* Tolerance / Sensitivity Slider */}
        <div className="space-y-1 text-[11px] font-mono bg-black/5 dark:bg-white/5 p-3 rounded-xl">
          <div className="flex justify-between items-center opacity-70">
            <span>Color Tolerance / Sensitivity</span>
            <span className="font-bold">{tolerance}</span>
          </div>
          <input
            type="range"
            min="10"
            max="70"
            value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-1.5 rounded-lg"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="p-2.5 liquid-control rounded-xl disabled:opacity-30 flex items-center gap-1 hover:opacity-80"
              title="Undo"
            >
              <Undo className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">Undo</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 liquid-control rounded-xl flex items-center gap-1 hover:opacity-80"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3 liquid-control rounded-xl font-semibold hover:opacity-80"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              style={{ backgroundColor: accentColor }}
              className="py-2.5 px-4 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Cutout</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

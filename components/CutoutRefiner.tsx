'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wand2,
  RotateCcw,
  Check,
  X,
  Undo,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Eraser,
  Paintbrush,
} from 'lucide-react';

interface CutoutRefinerProps {
  initialImage: string;
  originalImage?: string;
  onApply: (newBase64: string) => void;
  onClose: () => void;
  accentColor?: string;
}

type EditMode = 'magic-erase' | 'magic-restore';

export default function CutoutRefiner({
  initialImage,
  onApply,
  onClose,
  accentColor = '#2563eb',
}: CutoutRefinerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [history, setHistory] = useState<ImageData[]>([]);
  const [tolerance, setTolerance] = useState(50);
  const [mode, setMode] = useState<EditMode>('magic-erase');
  const [hasChanges, setHasChanges] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [canvasDims, setCanvasDims] = useState({ w: 0, h: 0 });

  const isDragging = useRef(false);
  const dragSnapshotRef = useRef<ImageData | null>(null);

  // Multi-pointer tracking for pinch-zoom
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPinchDist = useRef<number | null>(null);

  // ── Initialize canvas ──────────────────────────────────────────────────────
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
      const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initial]);
      setCanvasDims({ w: canvas.width, h: canvas.height });
    };
  }, [initialImage]);

  // ── Flood fill with perceptual luma-weighted distance ──────────────────────
  const floodFillAt = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    px: number,
    py: number,
    tol: number,
    fillMode: EditMode
  ) => {
    const imgData = ctx.getImageData(0, 0, w, h);
    const { data } = imgData;
    const targetIdx = (py * w + px) * 4;
    const tR = data[targetIdx];
    const tG = data[targetIdx + 1];
    const tB = data[targetIdx + 2];

    const visited = new Uint8Array(w * h);
    const stack: number[] = [py * w + px];

    while (stack.length > 0) {
      const pos = stack.pop()!;
      if (visited[pos]) continue;
      visited[pos] = 1;

      const idx = pos * 4;
      const dr = data[idx] - tR;
      const dg = data[idx + 1] - tG;
      const db = data[idx + 2] - tB;
      // Perceptual luma-weighted Euclidean distance (ITU-R BT.601)
      const dist = Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);

      if (dist <= tol) {
        data[idx + 3] = fillMode === 'magic-erase' ? 0 : 255;

        const x = pos % w;
        const y = Math.floor(pos / w);
        if (x > 0 && !visited[pos - 1]) stack.push(pos - 1);
        if (x < w - 1 && !visited[pos + 1]) stack.push(pos + 1);
        if (y > 0 && !visited[pos - w]) stack.push(pos - w);
        if (y < h - 1 && !visited[pos + w]) stack.push(pos + w);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };

  // ── Remove small isolated opaque specks via connected components ───────────
  const handleCleanSpecks = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const { data } = imgData;

    // Save snapshot for undo before modifying
    const snapshot = ctx.getImageData(0, 0, w, h);

    // -2 = transparent (skip), -1 = opaque unvisited
    const labels = new Int32Array(w * h).fill(-2);
    let totalOpaque = 0;

    for (let i = 0; i < w * h; i++) {
      if (data[i * 4 + 3] >= 128) {
        labels[i] = -1;
        totalOpaque++;
      }
    }

    // Minimum component size: at least 150px or 0.5% of total opaque area
    const minSize = Math.max(150, Math.floor(totalOpaque * 0.005));
    const components: number[][] = [];
    let labelId = 0;

    for (let i = 0; i < w * h; i++) {
      if (labels[i] !== -1) continue;

      const component: number[] = [];
      const stack = [i];
      labels[i] = labelId;

      while (stack.length > 0) {
        const p = stack.pop()!;
        component.push(p);
        const px = p % w;
        const py = Math.floor(p / w);

        if (py > 0 && labels[p - w] === -1) { labels[p - w] = labelId; stack.push(p - w); }
        if (py < h - 1 && labels[p + w] === -1) { labels[p + w] = labelId; stack.push(p + w); }
        if (px > 0 && labels[p - 1] === -1) { labels[p - 1] = labelId; stack.push(p - 1); }
        if (px < w - 1 && labels[p + 1] === -1) { labels[p + 1] = labelId; stack.push(p + 1); }
      }

      components.push(component);
      labelId++;
    }

    let cleaned = 0;
    for (const comp of components) {
      if (comp.length < minSize) {
        for (const p of comp) data[p * 4 + 3] = 0;
        cleaned++;
      }
    }

    if (cleaned > 0) {
      setHistory(prev => [...prev, snapshot]);
      ctx.putImageData(imgData, 0, 0);
      setHasChanges(true);
    }
  };

  // ── Coordinate mapping – getBoundingClientRect handles zoom automatically ──
  const getCanvasPos = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.floor(((clientX - rect.left) / rect.width) * canvas.width),
      y: Math.floor(((clientY - rect.top) / rect.height) * canvas.height),
    };
  };

  // ── Pointer events ─────────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size >= 2) {
      // Second finger: cancel any ongoing draw, enter pinch-zoom mode
      if (isDragging.current && dragSnapshotRef.current) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) ctx.putImageData(dragSnapshotRef.current, 0, 0);
        dragSnapshotRef.current = null;
      }
      isDragging.current = false;
      const pts = Array.from(activePointers.current.values());
      lastPinchDist.current = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      return;
    }

    // Single finger: start drawing
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    isDragging.current = true;
    dragSnapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const { x, y } = getCanvasPos(canvas, e.clientX, e.clientY);
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;
    floodFillAt(ctx, canvas.width, canvas.height, x, y, tolerance, mode);
    setHasChanges(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size >= 2) {
      // Pinch zoom
      const pts = Array.from(activePointers.current.values());
      const currentDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      if (lastPinchDist.current !== null && currentDist > 0) {
        const ratio = currentDist / lastPinchDist.current;
        setZoom(z => parseFloat(Math.min(4, Math.max(1, z * ratio)).toFixed(2)));
      }
      lastPinchDist.current = currentDist;
      return;
    }

    if (!isDragging.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { x, y } = getCanvasPos(canvas, e.clientX, e.clientY);
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;
    floodFillAt(ctx, canvas.width, canvas.height, x, y, tolerance, mode);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointers.current.delete(e.pointerId);

    if (activePointers.current.size === 0) {
      lastPinchDist.current = null;
      if (isDragging.current && dragSnapshotRef.current) {
        setHistory(prev => [...prev, dragSnapshotRef.current!]);
        dragSnapshotRef.current = null;
      }
      isDragging.current = false;
    }
  };

  // ── History ────────────────────────────────────────────────────────────────
  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(history[history.length - 1], 0, 0);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleReset = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(history[0], 0, 0);
    setHistory([history[0]]);
    setHasChanges(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onApply(canvas.toDataURL('image/png'));
    onClose();
  };

  // ── Zoom helpers ───────────────────────────────────────────────────────────
  const zoomIn = () => setZoom(z => parseFloat(Math.min(4, z + 0.5).toFixed(1)));
  const zoomOut = () => setZoom(z => parseFloat(Math.max(1, z - 0.5).toFixed(1)));

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden touch-none select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="liquid-glass rounded-[2rem] max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-white/20 dark:border-white/10 flex flex-col max-h-[92vh] max-h-[92dvh] overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold tracking-tight">Magic Cutout Refiner</h3>
          </div>
          <button onClick={onClose} className="p-1.5 liquid-control rounded-full hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Toolbar: mode toggle + zoom ── */}
        <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
          {/* Erase / Restore toggle */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('magic-erase')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-semibold ${
                mode === 'magic-erase'
                  ? 'bg-red-500/20 text-red-400 dark:text-red-300'
                  : 'opacity-50 hover:opacity-80'
              }`}
            >
              <Eraser className="w-3 h-3" />
              Erase
            </button>
            <button
              type="button"
              onClick={() => setMode('magic-restore')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-semibold ${
                mode === 'magic-restore'
                  ? 'bg-green-500/20 text-green-400 dark:text-green-300'
                  : 'opacity-50 hover:opacity-80'
              }`}
            >
              <Paintbrush className="w-3 h-3" />
              Restore
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={zoomOut}
              disabled={zoom <= 1}
              className="p-1.5 liquid-control rounded-lg disabled:opacity-30"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center opacity-60 font-bold">{Math.round(zoom * 100)}%</span>
            <button
              onClick={zoomIn}
              disabled={zoom >= 4}
              className="p-1.5 liquid-control rounded-lg disabled:opacity-30"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Canvas – scrollable when zoomed ── */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-[200px] rounded-2xl overflow-auto border border-black/10 dark:border-white/10 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] dark:bg-[repeating-conic-gradient(#1f2937_0%_25%,#111827_0%_50%)]"
          style={{ touchAction: 'none' }}
        >
          {/*
           * Inner div grows to the zoomed canvas size so the container scrolls.
           * The canvas CSS width/height follow zoom while the internal pixel
           * resolution stays fixed – getBoundingClientRect() accounts for this
           * automatically in getCanvasPos().
           */}
          <div
            style={{
              width: canvasDims.w ? `${canvasDims.w * zoom}px` : '100%',
              height: canvasDims.h ? `${canvasDims.h * zoom}px` : '100%',
              minWidth: '100%',
              minHeight: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{
                width: canvasDims.w ? `${canvasDims.w * zoom}px` : undefined,
                height: canvasDims.h ? `${canvasDims.h * zoom}px` : undefined,
                cursor: 'crosshair',
                touchAction: 'none',
                display: 'block',
              }}
            />
          </div>
        </div>

        {/* ── Tolerance slider ── */}
        <div className="space-y-1 text-[11px] font-mono bg-black/5 dark:bg-white/5 p-3 rounded-xl">
          <div className="flex justify-between items-center opacity-70">
            <span>Color Tolerance</span>
            <span className="font-bold">{tolerance}</span>
          </div>
          <input
            type="range"
            min="10"
            max="120"
            value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-1.5 rounded-lg"
          />
          <div className="flex justify-between opacity-40 text-[9px] mt-0.5">
            <span>Precise</span>
            <span>Aggressive</span>
          </div>
        </div>

        {/* ── Action bar ── */}
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
              title="Reset to original cutout"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">Reset</span>
            </button>

            <button
              type="button"
              onClick={handleCleanSpecks}
              className="p-2.5 liquid-control rounded-xl flex items-center gap-1 hover:opacity-80"
              title="Auto-remove small isolated specks"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">Clean</span>
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
              <span>Apply</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

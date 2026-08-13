'use client';

import React, { useEffect, useRef, useState } from 'react';
import { renderCard } from '@/lib/renderer';
import { ZoomIn, Move, Loader2 } from 'lucide-react';

interface CardCanvasProps {
  photo: string | null;
  name: string;
  role: string;
  builderTitle: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  onZoomChange: (zoom: number) => void;
  onOffsetChange: (x: number, y: number) => void;
  onCanvasRendered?: (canvas: HTMLCanvasElement) => void;
}

export default function CardCanvas({
  photo,
  name,
  role,
  builderTitle,
  zoom,
  offsetX,
  offsetY,
  onZoomChange,
  onOffsetChange,
  onCanvasRendered,
}: CardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Track starting positions for drag events
  const dragStart = useRef({ x: 0, y: 0, startOffsetX: 0, startOffsetY: 0 });

  useEffect(() => {
    let isMounted = true;

    const draw = async () => {
      setIsRendering(true);
      try {
        const renderedCanvas = await renderCard({
          photo,
          name,
          role,
          builderTitle,
          zoom,
          offsetX,
          offsetY,
        });

        if (!isMounted) return;

        const destCanvas = canvasRef.current;
        if (destCanvas) {
          destCanvas.width = renderedCanvas.width;
          destCanvas.height = renderedCanvas.height;
          const destCtx = destCanvas.getContext('2d');
          if (destCtx) {
            destCtx.drawImage(renderedCanvas, 0, 0);
          }
          if (onCanvasRendered) {
            onCanvasRendered(destCanvas);
          }
        }
      } catch (err) {
        console.error('Canvas render error:', err);
      } finally {
        if (isMounted) setIsRendering(false);
      }
    };

    // Add a slight debounce/animation frame delay for smooth typing updates
    const rId = requestAnimationFrame(draw);

    return () => {
      isMounted = false;
      cancelAnimationFrame(rId);
    };
  }, [photo, name, role, builderTitle, zoom, offsetX, offsetY, onCanvasRendered]);

  // Handle Drag Start (Mouse)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!photo) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
    };
  };

  // Handle Drag Move (Mouse)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !photo) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pixelDeltaX = e.clientX - dragStart.current.x;
    const pixelDeltaY = e.clientY - dragStart.current.y;

    // Convert pixel delta to relative offset [-1, 1].
    // Zooming in reduces panning movement to keep alignment precise.
    const sensitivity = 2.0 / zoom;
    const deltaX = (pixelDeltaX / rect.width) * sensitivity;
    const deltaY = (pixelDeltaY / rect.height) * sensitivity;

    // Direct panning logic (dragging moves photo along with cursor)
    const newOffsetX = Math.max(-1, Math.min(1, dragStart.current.startOffsetX - deltaX));
    const newOffsetY = Math.max(-1, Math.min(1, dragStart.current.startOffsetY - deltaY));

    onOffsetChange(newOffsetX, newOffsetY);
  };

  // Handle Drag End (Mouse)
  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Handle Touch Start (Mobile)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!photo || e.touches.length !== 1) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
    };
  };

  // Handle Touch Move (Mobile)
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !photo || e.touches.length !== 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pixelDeltaX = e.touches[0].clientX - dragStart.current.x;
    const pixelDeltaY = e.touches[0].clientY - dragStart.current.y;

    const sensitivity = 2.0 / zoom;
    const deltaX = (pixelDeltaX / rect.width) * sensitivity;
    const deltaY = (pixelDeltaY / rect.height) * sensitivity;

    const newOffsetX = Math.max(-1, Math.min(1, dragStart.current.startOffsetX - deltaX));
    const newOffsetY = Math.max(-1, Math.min(1, dragStart.current.startOffsetY - deltaY));

    onOffsetChange(newOffsetX, newOffsetY);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Live Canvas Wrapper with Retro Shadows */}
      <div className="relative w-full max-w-[420px] aspect-[2/3] bg-neutral-100 rounded border border-neutral-800 shadow-[8px_8px_0px_0px_rgba(18,18,18,1)] overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
          className={`w-full h-full block ${photo ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        />
        
        {/* Drag Overlay Helper */}
        {photo && (
          <div className="absolute top-3 left-3 bg-neutral-900/80 text-white font-mono text-[9px] px-2 py-1 rounded flex items-center gap-1.5 pointer-events-none uppercase tracking-widest">
            <Move className="w-3 h-3" />
            Drag card to position photo
          </div>
        )}

        {/* Loading Spinner */}
        {isRendering && (
          <div className="absolute inset-0 bg-neutral-900/10 flex items-center justify-center pointer-events-none">
            <div className="bg-white p-2 rounded-full border border-neutral-800 shadow">
              <Loader2 className="w-5 h-5 text-neutral-800 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Manual Fine-Tuning Controls (Visible only after photo upload) */}
      {photo && (
        <div className="w-full max-w-[420px] mt-6 p-4 bg-white border border-neutral-800 shadow-[4px_4px_0px_0px_rgba(18,18,18,1)] rounded flex flex-col gap-4">
          <p className="font-mono text-xs font-bold text-neutral-800 uppercase tracking-widest border-b border-neutral-200 pb-2">
            ⚙️ Position Fine-Tuning
          </p>

          {/* Zoom Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center font-mono text-[10px] text-neutral-600 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-neutral-600" /> ZOOM
              </span>
              <span className="font-bold">{zoom.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.02"
              value={zoom}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-full accent-neutral-800 cursor-pointer h-1.5 bg-neutral-100 rounded border border-neutral-200"
            />
          </div>

          {/* Pan X Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center font-mono text-[10px] text-neutral-600 uppercase tracking-wider">
              <span>↔ Horizontal Position</span>
              <span className="font-bold">{offsetX > 0 ? `Right +${Math.abs(offsetX * 100).toFixed(0)}` : offsetX < 0 ? `Left -${Math.abs(offsetX * 100).toFixed(0)}` : 'Center'}</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.02"
              value={offsetX}
              onChange={(e) => onOffsetChange(parseFloat(e.target.value), offsetY)}
              className="w-full accent-neutral-800 cursor-pointer h-1.5 bg-neutral-100 rounded border border-neutral-200"
            />
          </div>

          {/* Pan Y Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center font-mono text-[10px] text-neutral-600 uppercase tracking-wider">
              <span>↕ Vertical Position</span>
              <span className="font-bold">{offsetY > 0 ? `Down +${Math.abs(offsetY * 100).toFixed(0)}` : offsetY < 0 ? `Up -${Math.abs(offsetY * 100).toFixed(0)}` : 'Center'}</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.02"
              value={offsetY}
              onChange={(e) => onOffsetChange(offsetX, parseFloat(e.target.value))}
              className="w-full accent-neutral-800 cursor-pointer h-1.5 bg-neutral-100 rounded border border-neutral-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}

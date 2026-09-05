'use client';

import React, { useEffect, useRef, useState } from 'react';
import { OfficeEngine } from './OfficeEngine';
import { OfficeState } from '../../lib/types';
import { ZoomIn, ZoomOut, Maximize2, Sun, Grid, Eye } from 'lucide-react';

interface OfficeCanvasProps {
  officeState: OfficeState | null;
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
}

export const OfficeCanvas: React.FC<OfficeCanvasProps> = ({
  officeState,
  selectedAgentId,
  onSelectAgent,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<OfficeEngine | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [lighting, setLighting] = useState<boolean>(true);
  const [grid, setGrid] = useState<boolean>(true);

  // Initialize Canvas & Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new OfficeEngine(canvas, onSelectAgent);
    engineRef.current = engine;

    // Resize observer
    const handleResize = () => {
      if (containerRef.current && canvas) {
        const { clientWidth, clientHeight } = containerRef.current;
        engine.resize(clientWidth, clientHeight);
        engine.centerView();
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
  }, [onSelectAgent]);

  // Sync state
  useEffect(() => {
    if (engineRef.current && officeState) {
      engineRef.current.updateState(officeState);
    }
  }, [officeState]);

  // Sync selection
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSelectedAgent(selectedAgentId);
    }
  }, [selectedAgentId]);

  // Controls
  const handleZoomIn = () => engineRef.current?.zoomIn();
  const handleZoomOut = () => engineRef.current?.zoomOut();
  const handleCenter = () => engineRef.current?.centerView();
  const toggleLighting = () => {
    if (engineRef.current) {
      engineRef.current.enableLighting = !lighting;
      setLighting(!lighting);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[420px] overflow-hidden rounded-xl border border-[#324536] bg-[#121914] shadow-2xl"
    >
      <canvas ref={canvasRef} className="block w-full h-full select-none" />

      {/* Floating Canvas Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 rounded-lg border border-[#324536] bg-[#18231b]/90 p-1.5 backdrop-blur-md shadow-xl">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="rounded p-1.5 text-[#d8d2c4] hover:bg-[#28382c] hover:text-[#f4f1ea] transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="rounded p-1.5 text-[#d8d2c4] hover:bg-[#28382c] hover:text-[#f4f1ea] transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleCenter}
          title="Reset / Center View"
          className="rounded p-1.5 text-[#d8d2c4] hover:bg-[#28382c] hover:text-[#f4f1ea] transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="my-0.5 h-[1px] bg-[#2a3a2e]" />
        <button
          onClick={toggleLighting}
          title="Toggle Warm Office Lighting"
          className={`rounded p-1.5 transition-colors ${
            lighting
              ? 'text-[#e9c46a] bg-[#e9c46a]/15'
              : 'text-[#9ea8a0] hover:bg-[#243328]'
          }`}
        >
          <Sun className="w-4 h-4" />
        </button>
      </div>

      {/* Room Legend Chips */}
      <div className="absolute bottom-3 left-4 flex flex-wrap gap-2 text-[10px] text-[#ded8cc] font-mono pointer-events-none">
        <div className="flex items-center gap-1.5 rounded-md bg-[#18231b]/90 px-2.5 py-1 border border-[#324536] backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-[#3a6b88]" />
          <span>Conference Room</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-[#18231b]/90 px-2.5 py-1 border border-[#324536] backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-[#52b788]" />
          <span>Dev Workstations</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-[#18231b]/90 px-2.5 py-1 border border-[#324536] backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-[#e9c46a]" />
          <span>Cafe & Break Lounge</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-[#18231b]/90 px-2.5 py-1 border border-[#324536] backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-[#84a98c]" />
          <span>Server Cluster</span>
        </div>
      </div>

      {/* Subtle Warm Linen Texture Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(30,25,20,0)_50%,rgba(20,25,20,0.15)_50%)] bg-[length:100%_4px] opacity-20" />
    </div>
  );
};

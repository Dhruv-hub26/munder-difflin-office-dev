'use client';

import React, { useEffect, useRef, useState } from 'react';
import { OfficeEngine } from './OfficeEngine';
import { CameraPreset, OfficeState } from '../../lib/types';
import { ZoomIn, ZoomOut, Maximize2, Sun, Camera, Crosshair } from 'lucide-react';

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
  const [activePreset, setActivePreset] = useState<CameraPreset>('all');

  // Initialize Canvas & Engine safely
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let observer: ResizeObserver | null = null;

    // Wrap initialization in requestAnimationFrame to guarantee layout measurement
    const animId = requestAnimationFrame(() => {
      const width =
        containerRef.current?.clientWidth ||
        canvas.parentElement?.clientWidth ||
        1200;
      const height =
        containerRef.current?.clientHeight ||
        canvas.parentElement?.clientHeight ||
        750;

      const engine = new OfficeEngine(canvas, onSelectAgent);
      engineRef.current = engine;
      engine.resize(width, height);
      engine.centerView();

      if (officeState) {
        engine.updateState(officeState);
      }

      // Safe ResizeObserver with null / zero check
      const handleResize = () => {
        if (!canvas) return;
        const w =
          containerRef.current?.clientWidth ||
          canvas.parentElement?.clientWidth ||
          1200;
        const h =
          containerRef.current?.clientHeight ||
          canvas.parentElement?.clientHeight ||
          750;

        if (w > 0 && h > 0 && engineRef.current) {
          engineRef.current.resize(w, h);
          engineRef.current.centerView();
        }
      };

      if (containerRef.current) {
        observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);
      }
    });

    return () => {
      cancelAnimationFrame(animId);
      if (observer) observer.disconnect();
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
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

  // Camera Presets
  const handlePreset = (preset: CameraPreset) => {
    setActivePreset(preset);
    engineRef.current?.focusPreset(preset);
    if (preset === 'jim') onSelectAgent('coder');
    if (preset === 'server') onSelectAgent('devops');
    if (preset === 'pm') onSelectAgent('pm');
  };

  const handleZoomIn = () => engineRef.current?.zoomIn();
  const handleZoomOut = () => engineRef.current?.zoomOut();
  const handleCenter = () => {
    setActivePreset('all');
    engineRef.current?.centerView();
  };
  const toggleLighting = () => {
    if (engineRef.current) {
      engineRef.current.enableLighting = !lighting;
      setLighting(!lighting);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[420px] overflow-hidden rounded-xl border border-[#2D382E] bg-[#161A16] shadow-xl"
    >
      <canvas ref={canvasRef} className="block w-full h-full select-none" />

      {/* Top Left: Quick Camera Presets Bar */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg border border-[#2D382E] bg-[#1A221B]/90 p-1 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-[#84a98c]">
          <Camera className="h-3 w-3" />
          <span className="hidden sm:inline">Camera:</span>
        </div>
        <button
          onClick={() => handlePreset('all')}
          className={`rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
            activePreset === 'all'
              ? 'bg-[#28382C] text-[#FAF7EE] font-semibold border border-[#3E5040]'
              : 'text-[#9ea8a0] hover:bg-[#202922] hover:text-[#FAF7EE]'
          }`}
        >
          All Office
        </button>
        <button
          onClick={() => handlePreset('jim')}
          className={`rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
            activePreset === 'jim'
              ? 'bg-[#28382C] text-[#52b788] font-semibold border border-[#3E5040]'
              : 'text-[#9ea8a0] hover:bg-[#202922] hover:text-[#52b788]'
          }`}
        >
          Coder Jim
        </button>
        <button
          onClick={() => handlePreset('server')}
          className={`rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
            activePreset === 'server'
              ? 'bg-[#28382C] text-[#e9c46a] font-semibold border border-[#3E5040]'
              : 'text-[#9ea8a0] hover:bg-[#202922] hover:text-[#e9c46a]'
          }`}
        >
          Server Room
        </button>
        <button
          onClick={() => handlePreset('pm')}
          className={`rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
            activePreset === 'pm'
              ? 'bg-[#28382C] text-[#a8dadc] font-semibold border border-[#3E5040]'
              : 'text-[#9ea8a0] hover:bg-[#202922] hover:text-[#a8dadc]'
          }`}
        >
          Conference
        </button>
      </div>

      {/* Top Right: Zoom & Light Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 rounded-lg border border-[#2D382E] bg-[#1A221B]/90 p-1 backdrop-blur-md shadow-md">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="rounded p-1 text-[#d8d2c4] hover:bg-[#28382C] hover:text-[#FAF7EE] transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="rounded p-1 text-[#d8d2c4] hover:bg-[#28382C] hover:text-[#FAF7EE] transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCenter}
          title="Center Floor"
          className="rounded p-1 text-[#d8d2c4] hover:bg-[#28382C] hover:text-[#FAF7EE] transition-colors"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>
        <div className="my-0.5 h-[1px] bg-[#2D382E]" />
        <button
          onClick={toggleLighting}
          title="Toggle Warm Tungsten Lighting"
          className={`rounded p-1 transition-colors ${
            lighting ? 'text-[#e9c46a] bg-[#e9c46a]/15' : 'text-[#84a98c] hover:bg-[#28382C]'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Left: Room Legend Chips */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 text-[10px] text-[#ded8cc] font-mono pointer-events-none">
        <div className="flex items-center gap-1.5 rounded-md bg-[#161A16]/90 px-2 py-0.5 border border-[#2D382E] backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-[#3a6b88]" />
          <span>Conference</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-[#161A16]/90 px-2 py-0.5 border border-[#2D382E] backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-[#52b788]" />
          <span>Engineering</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-[#161A16]/90 px-2 py-0.5 border border-[#2D382E] backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-[#e9c46a]" />
          <span>Break Area</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-[#161A16]/90 px-2 py-0.5 border border-[#2D382E] backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-[#84a98c]" />
          <span>Server Racks</span>
        </div>
      </div>
    </div>
  );
};

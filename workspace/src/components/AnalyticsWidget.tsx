// MunderDifflin High-Performance Analytics Widget
import React, { useState, useEffect } from 'react';

export function AnalyticsWidget() {
  const [metrics, setMetrics] = useState({ rps: 1240, latencyP99: 4.2, uptime: 99.99 });

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        rps: prev.rps + Math.floor(Math.random() * 20 - 10),
        latencyP99: +(prev.latencyP99 + (Math.random() * 0.2 - 0.1)).toFixed(2),
        uptime: 99.99,
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 p-5 text-white shadow-xl backdrop-blur-md">
      <h3 className="text-sm font-semibold tracking-wider text-cyan-400 uppercase">Live Cluster Telemetry</h3>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg bg-slate-800/80 p-3">
          <p className="text-xs text-slate-400">Requests / sec</p>
          <p className="text-xl font-black text-emerald-400">{metrics.rps}</p>
        </div>
        <div className="rounded-lg bg-slate-800/80 p-3">
          <p className="text-xs text-slate-400">P99 Latency</p>
          <p className="text-xl font-black text-cyan-400">{metrics.latencyP99}ms</p>
        </div>
        <div className="rounded-lg bg-slate-800/80 p-3">
          <p className="text-xs text-slate-400">Availability</p>
          <p className="text-xl font-black text-purple-400">{metrics.uptime}%</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useOfficeState } from '../hooks/useOfficeState';
import { TaskBoard } from '../components/kanban/TaskBoard';
import { FileTree } from '../components/workspace/FileTree';
import { AgentInspector } from '../components/agent-panel/AgentInspector';

const OfficeCanvas = dynamic(
  () => import('../components/office/OfficeCanvas').then((mod) => mod.OfficeCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-[#324536] bg-[#121914] text-[#84a98c] font-mono text-xs">
        <span className="animate-pulse">Loading Munder-Difflin Office Engine...</span>
      </div>
    ),
  }
);

const AgentTerminal = dynamic(
  () => import('../components/terminal/AgentTerminal').then((mod) => mod.AgentTerminal),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-[#324536] bg-[#0d130f] text-[#ded8cc] font-mono text-xs">
        <span className="animate-pulse">Initializing terminal stream...</span>
      </div>
    ),
  }
);

import {
  Building2,
  Terminal,
  Kanban,
  FolderTree,
  UserCheck,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Coins,
  GitBranch,
  Wifi,
  WifiOff,
  Bot,
} from 'lucide-react';

const PRESET_PROMPTS = [
  'Build a Next.js real-time analytics widget with telemetry aggregator',
  'Implement JWT & Argon2 encrypted session store with CSRF protection',
  'Create high-performance LRU cache and event bus microservice',
  'Scaffold responsive dark-mode checkout modal with Stripe webhooks',
];

export default function Home() {
  const {
    officeState,
    mailbox,
    selectedAgentId,
    setSelectedAgentId,
    isConnected,
    startSprint,
    togglePause,
    resetOffice,
  } = useOfficeState();

  const [activeTab, setActiveTab] = useState<'inspector' | 'terminal' | 'kanban' | 'workspace'>('terminal');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const metrics = officeState?.metrics || {
    totalTokens: 5750,
    totalCost: 0.0171,
    activeAgents: 0,
    completedTasks: 2,
    totalTasks: 2,
    uptimeSeconds: 0,
    gitBranch: 'main',
    currentProject: 'MunderDifflin / Core Workspace',
    isPaused: false,
  };

  const selectedAgent = selectedAgentId && officeState?.agents ? officeState.agents[selectedAgentId] : null;

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    startSprint(customPrompt);
    setCustomPrompt('');
    setActiveTab('terminal');
  };

  const handleSelectPreset = (preset: string) => {
    startSprint(preset);
    setActiveTab('terminal');
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-[#1b201a] text-[#f4f1de] overflow-hidden select-none">
      {/* 1. TOP RETRO CORPORATE NAVIGATION BAR */}
      <header className="h-[92px] shrink-0 border-b border-[#28382c] bg-[#162018]/95 backdrop-blur-md px-4 py-2 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5335] to-[#422c19] border border-[#a67c52]/50 shadow-md shadow-[#422c19]/30">
              <Building2 className="h-4 w-4 text-[#f8f5ee]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-black tracking-wider text-[#f4f1ea] uppercase">
                  MUNDER-DIFFLIN <span className="text-[#e9c46a] font-mono">// OFFICEDEV</span>
                </h1>
                <span className="rounded bg-[#223024] border border-[#3f5745] px-1.5 py-0.2 text-[8px] font-mono font-semibold text-[#84a98c]">
                  v2.4-CORP
                </span>
              </div>
              <p className="text-[10px] text-[#b8ad9c] font-mono leading-none">
                Warm Retro Corporate Multi-Agent Virtual Office
              </p>
            </div>
          </div>

          {/* Live Telemetry Meters */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-[11px]">
            {/* Connection Status */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#324536] bg-[#1b261e] px-2 py-0.5">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 text-[#52b788]" />
                  <span className="text-[#52b788] text-[10px] font-semibold">ONLINE SYNC</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-[#e9c46a]" />
                  <span className="text-[#e9c46a] text-[10px]">CONNECTING</span>
                </>
              )}
            </div>

            {/* Active Agents */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#324536] bg-[#1b261e] px-2 py-0.5">
              <Bot className="h-3 w-3 text-[#84a98c]" />
              <span className="text-[#b8ad9c]">Agents:</span>
              <span className="font-bold text-[#f4f1ea]">
                {metrics.activeAgents} / 4 Active
              </span>
            </div>

            {/* Tokens Gauge */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#324536] bg-[#1b261e] px-2 py-0.5">
              <Zap className="h-3 w-3 text-[#e9c46a]" />
              <span className="text-[#b8ad9c]">Tokens:</span>
              <span className="font-bold text-[#e9c46a]">
                {metrics.totalTokens.toLocaleString()}
              </span>
            </div>

            {/* Estimated Cost */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#324536] bg-[#1b261e] px-2 py-0.5">
              <Coins className="h-3 w-3 text-[#52b788]" />
              <span className="text-[#b8ad9c]">Cost:</span>
              <span className="font-bold text-[#52b788]">
                ${metrics.totalCost.toFixed(4)}
              </span>
            </div>

            {/* Git Branch */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#324536] bg-[#1b261e] px-2 py-0.5">
              <GitBranch className="h-3 w-3 text-[#d4a373]" />
              <span className="text-[#b8ad9c]">Branch:</span>
              <span className="font-bold text-[#d4a373]">
                {metrics.gitBranch}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={togglePause}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-mono font-medium transition-all cursor-pointer ${
                metrics.isPaused
                  ? 'border-[#52b788]/60 bg-[#1e3325] text-[#52b788] hover:bg-[#253f2e]'
                  : 'border-[#e9c46a]/60 bg-[#2b2416] text-[#e9c46a] hover:bg-[#382f1d]'
              }`}
            >
              {metrics.isPaused ? (
                <>
                  <Play className="h-3 w-3 fill-current" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3 fill-current" />
                  <span>Pause</span>
                </>
              )}
            </button>

            <button
              onClick={resetOffice}
              title="Reset Sandbox & Agents"
              className="flex items-center gap-1 rounded-lg border border-[#44302d] bg-[#221817] px-2.5 py-1 text-xs font-mono text-[#e5989b] hover:bg-[#2f1f1d] hover:text-[#f8d7da] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Sprint Prompt Submission Bar & Presets */}
        <div className="flex items-center gap-2 pt-1">
          <form onSubmit={handlePromptSubmit} className="flex-1 min-w-[280px] flex items-center gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Submit sprint goal (e.g. Build an analytics widget or auth session)..."
              className="flex-1 rounded-md border border-[#384c3c] bg-[#162119] px-3 py-1 text-xs font-mono text-[#f4f1ea] placeholder-[#7e8c80] shadow-inner focus:border-[#84a98c] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!customPrompt.trim()}
              className="flex items-center gap-1 rounded-md bg-gradient-to-r from-[#d4a373] to-[#b07d4f] px-3 py-1 text-xs font-mono font-bold text-[#1f1710] shadow hover:from-[#e2b082] hover:to-[#be8959] disabled:opacity-40 transition-all cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              <span>Launch</span>
            </button>
          </form>

          {/* Preset Chips */}
          <div className="hidden xl:flex items-center gap-1.5 text-[10px] font-mono text-[#b8ad9c]">
            <span className="text-[#84a98c]">Presets:</span>
            {PRESET_PROMPTS.slice(0, 2).map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(p)}
                className="rounded border border-[#324536] bg-[#1a251e] px-2 py-0.5 text-[#ded8cc] hover:border-[#84a98c] hover:text-[#f4f1ea] transition-colors cursor-pointer"
              >
                {p.length > 34 ? `${p.slice(0, 34)}...` : p}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. MAIN FULL-SCREEN SPLIT VIEWPORT */}
      <main className="flex flex-1 flex-row gap-3 p-3 h-[calc(100vh-92px)] min-h-0 overflow-hidden">
        {/* Center / Left: 2D Virtual Office Viewport */}
        <section className="flex-1 flex flex-col h-full min-w-0 rounded-xl border border-[#324536] bg-[#121914] overflow-hidden relative shadow-lg">
          <OfficeCanvas
            officeState={officeState}
            selectedAgentId={selectedAgentId}
            onSelectAgent={(agentId) => {
              setSelectedAgentId(agentId);
              setActiveTab('inspector');
            }}
          />
        </section>

        {/* Right Sidebar: Multi-Tab Drawer */}
        <section className="flex flex-col w-[540px] 2xl:w-[640px] h-full shrink-0 rounded-xl border border-[#324536] bg-[#162119]/95 backdrop-blur-md shadow-2xl overflow-hidden">
          {/* Tab Navigation Header */}
          <div className="flex items-center justify-between border-b border-[#28382c] bg-[#1a251e]/95 px-2 pt-2 shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('terminal')}
                className={`flex items-center gap-1.5 rounded-t-lg px-3 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeTab === 'terminal'
                    ? 'border-t-2 border-t-[#84a98c] bg-[#121814] text-[#f4f1ea] font-semibold'
                    : 'text-[#9ca79e] hover:bg-[#1f2c22] hover:text-[#ded8cc]'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Terminal</span>
              </button>

              <button
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-1.5 rounded-t-lg px-3 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeTab === 'kanban'
                    ? 'border-t-2 border-t-[#84a98c] bg-[#121814] text-[#f4f1ea] font-semibold'
                    : 'text-[#9ca79e] hover:bg-[#1f2c22] hover:text-[#ded8cc]'
                }`}
              >
                <Kanban className="h-3.5 w-3.5" />
                <span>Kanban</span>
                {officeState?.tasks && (
                  <span className="rounded-full bg-[#253529] px-1.5 py-0.2 text-[9px] text-[#e9c46a]">
                    {officeState.tasks.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('workspace')}
                className={`flex items-center gap-1.5 rounded-t-lg px-3 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeTab === 'workspace'
                    ? 'border-t-2 border-t-[#84a98c] bg-[#121814] text-[#f4f1ea] font-semibold'
                    : 'text-[#9ca79e] hover:bg-[#1f2c22] hover:text-[#ded8cc]'
                }`}
              >
                <FolderTree className="h-3.5 w-3.5" />
                <span>/workspace</span>
              </button>

              <button
                onClick={() => setActiveTab('inspector')}
                className={`flex items-center gap-1.5 rounded-t-lg px-3 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeTab === 'inspector'
                    ? 'border-t-2 border-t-[#84a98c] bg-[#121814] text-[#f4f1ea] font-semibold'
                    : 'text-[#9ca79e] hover:bg-[#1f2c22] hover:text-[#ded8cc]'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Agent Info</span>
                {selectedAgent && (
                  <span className="hidden sm:inline-block text-[10px] text-[#e9c46a] font-bold">
                    ({selectedAgent.name.split(' ')[0]})
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="flex-1 p-2 bg-[#121814] min-h-0 overflow-hidden">
            {activeTab === 'terminal' && (
              <AgentTerminal activeAgentId={selectedAgentId} />
            )}

            {activeTab === 'kanban' && (
              <TaskBoard tasks={officeState?.tasks || []} />
            )}

            {activeTab === 'workspace' && (
              <FileTree />
            )}

            {activeTab === 'inspector' && (
              <AgentInspector agent={selectedAgent} mailbox={mailbox} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

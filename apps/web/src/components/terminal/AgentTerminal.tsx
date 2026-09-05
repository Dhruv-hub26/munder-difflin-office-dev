'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { getSocket, sendTerminalInput } from '../../lib/socket';
import { Terminal as TerminalIcon, Trash2, Copy, Play } from 'lucide-react';

interface AgentTerminalProps {
  activeAgentId: string | null;
}

const AGENT_CHIPS = [
  { id: 'ALL', name: 'ALL LOGS', color: 'text-[#e9c46a] border-[#9c7d42]/50 bg-[#252216]' },
  { id: 'pm', name: 'PM Michael', color: 'text-[#a8dadc] border-[#457b9d]/50 bg-[#182428]' },
  { id: 'coder', name: 'Coder Jim', color: 'text-[#52b788] border-[#2d6a4f]/50 bg-[#16271c]' },
  { id: 'reviewer', name: 'QA Dwight', color: 'text-[#e9c46a] border-[#c49a45]/50 bg-[#282215]' },
  { id: 'devops', name: 'DevOps Pam', color: 'text-[#f4a261] border-[#c86d51]/50 bg-[#2c1d18]' },
];

export const AgentTerminal: React.FC<AgentTerminalProps> = ({ activeAgentId }) => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddonInstance = useRef<FitAddon | null>(null);

  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [commandInput, setCommandInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Sync with active agent selection from canvas if changed
  useEffect(() => {
    if (activeAgentId && activeAgentId !== 'ALL') {
      setSelectedStream(activeAgentId);
    }
  }, [activeAgentId]);

  // Initialize xterm
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: '"JetBrains Mono", Menlo, Consolas, monospace',
      fontSize: 12,
      lineHeight: 1.35,
      theme: {
        background: '#0d130f', // Deep rich olive-charcoal
        foreground: '#f5f2eb', // Warm ivory high contrast
        cursor: '#e9c46a',     // Warm amber cursor
        selectionBackground: 'rgba(233, 196, 106, 0.3)',
        black: '#162119',
        red: '#e76f51',
        green: '#52b788',
        yellow: '#e9c46a',
        blue: '#457b9d',
        magenta: '#d4a373',
        cyan: '#84a98c',
        white: '#fbf8f2',
        brightBlack: '#6b7a6f',
        brightRed: '#f4a261',
        brightGreen: '#74c69d',
        brightYellow: '#f1dca7',
        brightBlue: '#6ea4bf',
        brightMagenta: '#e29578',
        brightCyan: '#a3c4ab',
        brightWhite: '#ffffff',
      },
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstance.current = term;
    fitAddonInstance.current = fitAddon;

    // Welcome banner in warm corporate styling
    term.writeln('\x1b[1;33m┌─────────────────────────────────────────────────────────────┐\x1b[0m');
    term.writeln('\x1b[1;33m│\x1b[0m   \x1b[1;32m⚡ MUNDER-DIFFLIN // OFFICEDEV RUNTIME EMULATOR\x1b[0m           \x1b[1;33m│\x1b[0m');
    term.writeln('\x1b[1;33m│\x1b[0m   Streaming live sandbox I/O from isolated ./workspace ...  \x1b[1;33m│\x1b[0m');
    term.writeln('\x1b[1;33m└─────────────────────────────────────────────────────────────┘\x1b[0m\r\n');

    const socket = getSocket();
    const handleTerminalChunk = (data: { agentId: string; chunk: string }) => {
      term.write(data.chunk);
    };

    socket.on('terminal:chunk', handleTerminalChunk);

    term.onData((data) => {
      sendTerminalInput(selectedStream === 'ALL' ? 'coder' : selectedStream, data);
    });

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch {}
    };

    window.addEventListener('resize', handleResize);

    return () => {
      socket.off('terminal:chunk', handleTerminalChunk);
      window.removeEventListener('resize', handleResize);
      term.dispose();
      xtermInstance.current = null;
      fitAddonInstance.current = null;
    };
  }, [selectedStream]);

  const handleClear = () => {
    xtermInstance.current?.clear();
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    xtermInstance.current?.writeln(`\x1b[33m$ ${commandInput}\x1b[0m`);
    sendTerminalInput(
      selectedStream === 'ALL' ? 'coder' : selectedStream,
      `${commandInput}\r\n`
    );
    setCommandInput('');
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#324536] bg-[#0d130f] shadow-xl overflow-hidden">
      {/* Terminal Header & Stream Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#28382c] bg-[#162119]/95 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-[#e9c46a]" />
          <span className="text-xs font-semibold tracking-wider text-[#f4f1ea] uppercase">
            Live Stream
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#52b788] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#52b788]"></span>
          </span>
        </div>

        {/* Stream Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {AGENT_CHIPS.map((chip) => {
            const isCurrent = selectedStream === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setSelectedStream(chip.id)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-mono font-medium border transition-all ${
                  isCurrent
                    ? `${chip.color} shadow-sm ring-1 ring-[#84a98c]/30`
                    : 'border-[#28382c] text-[#a6b2a8] hover:bg-[#1f2d22] hover:text-[#f4f1ea]'
                }`}
              >
                {chip.name}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            title="Copy Output"
            className="flex items-center gap-1 rounded border border-[#324536] bg-[#1a251e] px-2.5 py-1 text-[11px] text-[#ded8cc] hover:text-[#f4f1ea] hover:bg-[#253529] transition-colors"
          >
            <Copy className="h-3 w-3" />
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleClear}
            title="Clear Terminal"
            className="flex items-center gap-1 rounded border border-[#324536] bg-[#1a251e] px-2.5 py-1 text-[11px] text-[#ded8cc] hover:text-[#f8d7da] hover:bg-[#2e1d1b] transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* xterm Container */}
      <div className="relative flex-1 min-h-[220px] p-2.5 bg-[#0d130f] overflow-hidden">
        <div ref={terminalRef} className="h-full w-full" />
      </div>

      {/* Terminal Stdin Prompt Bar */}
      <form
        onSubmit={handleSendCommand}
        className="flex items-center gap-2 border-t border-[#28382c] bg-[#162119] px-3.5 py-2"
      >
        <span className="font-mono text-xs font-bold text-[#e9c46a]">$</span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder={`Send stdin to ${selectedStream === 'ALL' ? 'active agents' : selectedStream}... (e.g. npm test)`}
          className="flex-1 bg-transparent text-xs font-mono text-[#f4f1ea] placeholder-[#7d8c80] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!commandInput.trim()}
          className="flex items-center gap-1 rounded border border-[#4a6350] bg-[#273d2d] px-3 py-1 text-xs font-mono text-[#f4f1ea] hover:bg-[#34523d] disabled:opacity-40 transition-colors"
        >
          <Play className="h-3 w-3 fill-current" />
          <span>Exec</span>
        </button>
      </form>
    </div>
  );
};

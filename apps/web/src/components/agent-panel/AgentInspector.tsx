'use client';

import React from 'react';
import { Agent, MailboxMessage } from '../../lib/types';
import {
  User,
  Coins,
  Activity,
  Mail,
  Zap,
} from 'lucide-react';

interface AgentInspectorProps {
  agent: Agent | null;
  mailbox: MailboxMessage[];
}

export const AgentInspector: React.FC<AgentInspectorProps> = ({ agent, mailbox }) => {
  if (!agent) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-[#324536] bg-[#121814] p-8 text-center text-[#7e8c81] font-mono text-xs">
        Select an agent in the virtual office or terminal to inspect telemetry.
      </div>
    );
  }

  const agentMessages = mailbox.filter(
    (m) => m.to === agent.id || m.from === agent.id || m.to === 'ALL'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CODING':
        return 'text-[#52b788] bg-[#16271c] border-[#2d6a4f]';
      case 'TESTING':
        return 'text-[#e9c46a] bg-[#282215] border-[#9c7d42]';
      case 'DEPLOYING':
        return 'text-[#f4a261] bg-[#2c1d18] border-[#c86d51]';
      case 'PLANNING':
        return 'text-[#a8dadc] bg-[#182428] border-[#457b9d]';
      case 'WALKING':
        return 'text-[#d4a373] bg-[#29221a] border-[#8a6845]';
      default:
        return 'text-[#ded8cc] bg-[#202b23] border-[#324536]';
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#324536] bg-[#121814] p-4 shadow-xl overflow-y-auto">
      {/* Agent Profile Header */}
      <div className="flex items-start justify-between border-b border-[#28382c] pb-4">
        <div className="flex items-center gap-3">
          {/* Avatar Color Swatch Icon */}
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#7c5335]/60 shadow-lg"
            style={{ backgroundColor: agent.avatarConfig.shirtColor || '#386641' }}
          >
            <User className="h-6 w-6 text-[#f8f5ee]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#f4f1ea]">{agent.name}</h2>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${getStatusColor(
                  agent.status
                )}`}
              >
                {agent.status}
              </span>
            </div>
            <p className="text-xs text-[#e9c46a] font-mono mt-0.5">{agent.title}</p>
          </div>
        </div>

        {/* Token and Cost Metrics */}
        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="flex items-center justify-end gap-1 text-[#b8ad9c] text-xs">
              <Zap className="h-3 w-3 text-[#e9c46a]" />
              <span>Tokens</span>
            </div>
            <p className="text-sm font-bold font-mono text-[#f4f1ea]">
              {agent.tokensUsed.toLocaleString()}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-end gap-1 text-[#b8ad9c] text-xs">
              <Coins className="h-3 w-3 text-[#52b788]" />
              <span>Cost</span>
            </div>
            <p className="text-sm font-bold font-mono text-[#52b788]">
              ${agent.costUsd.toFixed(4)}
            </p>
          </div>
        </div>
      </div>

      {/* Current Activity Banner */}
      <div className="mt-3.5 rounded-lg border border-[#3e5f48] bg-[#17251c] p-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#52b788] uppercase font-mono">
          <Activity className="h-3.5 w-3.5 animate-pulse" />
          <span>Active Assignment & Telemetry</span>
        </div>
        <p className="mt-1 text-xs text-[#f4f1ea] font-mono">
          {agent.currentAction || 'At workstation'}
        </p>
      </div>

      {/* Persona & System Prompt */}
      <div className="mt-4">
        <h3 className="text-xs font-semibold text-[#b8ad9c] uppercase tracking-wider font-mono">
          Autonomous Persona & Role Description
        </h3>
        <p className="mt-1 rounded-lg border border-[#28382c] bg-[#152018] p-3 text-xs leading-relaxed text-[#ded8cc] font-mono">
          {agent.persona}
        </p>
      </div>

      {/* Mailbox Section */}
      <div className="mt-4 flex-1 flex flex-col">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#b8ad9c] uppercase tracking-wider font-mono">
            <Mail className="h-3.5 w-3.5 text-[#e9c46a]" />
            <span>Agent Mailbox ({agentMessages.length})</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto max-h-56 pr-1">
          {agentMessages.map((msg) => {
            const isOutgoing = msg.from === agent.id;
            return (
              <div
                key={msg.id}
                className={`rounded-lg border p-2.5 text-xs font-mono transition-all ${
                  isOutgoing
                    ? 'border-[#2d3d31] bg-[#17221a] text-[#ded8cc]'
                    : 'border-[#3e6047] bg-[#1a2b1f] text-[#f4f1ea]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-[#e9c46a]">
                    {isOutgoing ? `To @${msg.to}` : `From @${msg.from}`}
                  </span>
                  <span className="text-[10px] text-[#8e9c91]">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="font-semibold text-[#f4f1ea]">{msg.subject}</p>
                <p className="mt-1 text-[11px] text-[#ded8cc] line-clamp-2 whitespace-pre-line">
                  {msg.content}
                </p>
              </div>
            );
          })}

          {agentMessages.length === 0 && (
            <div className="py-6 text-center text-xs text-[#7e8c81] font-mono">
              No mailbox messages for this agent yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

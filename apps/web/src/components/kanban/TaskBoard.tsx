'use client';

import React, { useState } from 'react';
import { Task, TaskStatus } from '../../lib/types';
import {
  CheckCircle2,
  Code2,
  FileCode,
  Flame,
  Layers,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
}

const COLUMNS: Array<{ id: TaskStatus; label: string; color: string; border: string }> = [
  { id: 'BACKLOG', label: 'Backlog', color: 'text-[#b8ad9c]', border: 'border-[#324536]' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'text-[#52b788]', border: 'border-[#3e6047]' },
  { id: 'REVIEW', label: 'In Review', color: 'text-[#e9c46a]', border: 'border-[#7c6332]' },
  { id: 'DONE', label: 'Done', color: 'text-[#84a98c]', border: 'border-[#52796f]' },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks }) => {
  const [expandedDiffId, setExpandedDiffId] = useState<string | null>(null);

  const toggleDiff = (id: string) => {
    setExpandedDiffId(expandedDiffId === id ? null : id);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1 rounded bg-[#3b1c1a] px-2 py-0.5 text-[10px] font-bold text-[#f4a261] border border-[#7a322c]">
            <Flame className="h-2.5 w-2.5" /> CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="rounded bg-[#332612] px-2 py-0.5 text-[10px] font-bold text-[#e9c46a] border border-[#6b5020]">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="rounded bg-[#192b23] px-2 py-0.5 text-[10px] font-medium text-[#84a98c] border border-[#2e5240]">
            MED
          </span>
        );
      default:
        return (
          <span className="rounded bg-[#202b23] px-2 py-0.5 text-[10px] font-medium text-[#b8ad9c] border border-[#2e3d32]">
            LOW
          </span>
        );
    }
  };

  const getAgentTag = (agentId: string | null) => {
    if (!agentId) return null;
    const names: Record<string, { name: string; color: string }> = {
      pm: { name: 'Michael (PM)', color: 'bg-[#18262b] text-[#a8dadc] border-[#29424c]' },
      coder: { name: 'Jim (Coder)', color: 'bg-[#14281c] text-[#52b788] border-[#244c33]' },
      reviewer: { name: 'Dwight (QA)', color: 'bg-[#292213] text-[#e9c46a] border-[#5e4b25]' },
      devops: { name: 'Pam (DevOps)', color: 'bg-[#2c1b16] text-[#f4a261] border-[#5a3228]' },
    };
    const info = names[agentId] || { name: agentId, color: 'bg-[#202b23] text-[#ded8cc] border-[#324536]' };
    return (
      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-medium ${info.color}`}>
        @{info.name}
      </span>
    );
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#324536] bg-[#121814] p-4 shadow-xl overflow-hidden">
      {/* Board Header */}
      <div className="mb-4 flex items-center justify-between border-b border-[#28382c] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#e9c46a]" />
          <h2 className="text-sm font-semibold tracking-wider text-[#f4f1ea] uppercase">
            Sprint Kanban Board
          </h2>
          <span className="rounded-full bg-[#202c23] border border-[#324536] px-2.5 py-0.5 text-xs font-mono text-[#ded8cc]">
            {tasks.length} tasks
          </span>
        </div>
        <div className="text-xs font-mono text-[#b8ad9c]">
          Completed: {tasks.filter((t) => t.status === 'DONE').length} / {tasks.length}
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid flex-1 grid-cols-1 md:grid-cols-4 gap-3.5 overflow-y-auto pr-1">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-lg border ${col.border} bg-[#152018]/90 p-3 min-h-[300px]`}
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center justify-between">
                <span className={`text-xs font-bold font-mono uppercase tracking-wider ${col.color}`}>
                  {col.label}
                </span>
                <span className="rounded bg-[#202c23] px-2 py-0.5 text-[11px] font-mono text-[#ded8cc]">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="flex flex-col gap-2.5 flex-1">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group rounded-lg border border-[#2d3d31] bg-[#1a261e] p-3 shadow-md hover:border-[#84a98c] transition-all"
                  >
                    <div className="mb-2 flex items-start justify-between gap-1.5">
                      {getPriorityBadge(task.priority)}
                      {getAgentTag(task.assignedAgentId)}
                    </div>

                    <h3 className="text-xs font-semibold text-[#f4f1ea] leading-snug">
                      {task.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-[#b8ad9c] leading-relaxed line-clamp-2">
                      {task.description}
                    </p>

                    {/* Files affected */}
                    {task.files.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1 text-[10px] text-[#84a98c] font-mono">
                        <FileCode className="h-3 w-3 text-[#e9c46a]" />
                        <span>{task.files[0]}</span>
                        {task.files.length > 1 && (
                          <span className="text-[#8e9c91]">+{task.files.length - 1}</span>
                        )}
                      </div>
                    )}

                    {/* Diff Preview Button */}
                    {task.diff && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleDiff(task.id)}
                          className="flex items-center gap-1 text-[10px] font-mono text-[#e9c46a] hover:text-[#f4a261]"
                        >
                          <Code2 className="h-3 w-3" />
                          <span>Diff View</span>
                          {expandedDiffId === task.id ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                        {expandedDiffId === task.id && (
                          <pre className="mt-2 max-h-32 overflow-auto rounded bg-[#0d130f] p-2 text-[9px] font-mono text-[#52b788] border border-[#28382c]">
                            {task.diff}
                          </pre>
                        )}
                      </div>
                    )}

                    {/* Review Notes */}
                    {task.reviewNotes && task.reviewNotes.length > 0 && (
                      <div className="mt-2 rounded bg-[#272215] border border-[#5c4927] p-1.5 text-[10px] text-[#f1dca7] font-mono">
                        <div className="flex items-center gap-1 font-semibold mb-0.5 text-[#e9c46a]">
                          <ShieldCheck className="h-3 w-3 text-[#e9c46a]" /> Dwight QA Signoff:
                        </div>
                        {task.reviewNotes[0]}
                      </div>
                    )}

                    {/* Done Check */}
                    {task.status === 'DONE' && (
                      <div className="mt-2.5 flex items-center gap-1 text-[10px] font-mono text-[#52b788]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Deployment Verified</span>
                      </div>
                    )}
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded border border-dashed border-[#28382c] p-4 text-center text-xs text-[#7e8c81] font-mono">
                    No items
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

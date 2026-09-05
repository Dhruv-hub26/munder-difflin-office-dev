'use client';

import React, { useEffect, useState } from 'react';
import { FileTreeNode } from '../../lib/types';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  RefreshCw,
  Copy,
  Code,
  Check,
} from 'lucide-react';

interface FileTreeProps {
  serverUrl?: string;
}

export const FileTree: React.FC<FileTreeProps> = ({ serverUrl = 'http://localhost:4000' }) => {
  const [files, setFiles] = useState<FileTreeNode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '': true,
    src: true,
  });
  const [copied, setCopied] = useState<boolean>(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${serverUrl}/api/workspace/files`);
      const data = await res.json();
      if (data.success && data.files) {
        setFiles(data.files);
        if (!selectedFile && data.files.length > 0) {
          const first = findFirstFile(data.files);
          if (first) {
            loadFile(first.relativePath);
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch workspace files:', err);
    } finally {
      setLoading(false);
    }
  };

  const findFirstFile = (nodes: FileTreeNode[]): FileTreeNode | null => {
    for (const node of nodes) {
      if (node.type === 'file') return node;
      if (node.children) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const loadFile = async (relativePath: string) => {
    setSelectedFile(relativePath);
    setLoadingContent(true);
    try {
      const res = await fetch(
        `${serverUrl}/api/workspace/content?file=${encodeURIComponent(relativePath)}`
      );
      const data = await res.json();
      if (data.success && data.content !== undefined) {
        setFileContent(data.content);
      } else {
        setFileContent('// File is empty or could not be loaded');
      }
    } catch (err) {
      setFileContent(`// Error reading file: ${err}`);
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    const timer = setInterval(fetchFiles, 4000);
    return () => clearInterval(timer);
  }, []);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const copyContent = () => {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const renderTree = (nodes: FileTreeNode[]) => {
    return (
      <ul className="space-y-1 font-mono text-xs">
        {nodes.map((node) => {
          if (node.type === 'directory') {
            const isExpanded = !!expandedFolders[node.relativePath];
            return (
              <li key={node.path}>
                <button
                  onClick={() => toggleFolder(node.relativePath)}
                  className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-[#ded8cc] hover:bg-[#202c22] transition-colors text-left"
                >
                  {isExpanded ? (
                    <FolderOpen className="h-3.5 w-3.5 text-[#e9c46a] shrink-0" />
                  ) : (
                    <Folder className="h-3.5 w-3.5 text-[#e9c46a] shrink-0" />
                  )}
                  <span className="font-semibold text-[#f4f1ea]">{node.name}</span>
                </button>
                {isExpanded && node.children && (
                  <div className="ml-3.5 border-l border-[#28382c] pl-2 mt-0.5">
                    {renderTree(node.children)}
                  </div>
                )}
              </li>
            );
          } else {
            const isSelected = selectedFile === node.relativePath;
            return (
              <li key={node.path}>
                <button
                  onClick={() => loadFile(node.relativePath)}
                  className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left transition-colors ${
                    isSelected
                      ? 'bg-[#273d2e] text-[#f4f1ea] font-medium border border-[#52796f]'
                      : 'text-[#b8ad9c] hover:bg-[#1e2a20] hover:text-[#f4f1ea]'
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5 text-[#84a98c] shrink-0" />
                  <span className="truncate">{node.name}</span>
                </button>
              </li>
            );
          }
        })}
      </ul>
    );
  };

  return (
    <div className="flex h-full rounded-xl border border-[#324536] bg-[#121814] shadow-xl overflow-hidden">
      {/* File Tree Sidebar */}
      <div className="w-64 border-r border-[#28382c] bg-[#152018]/95 p-3 flex flex-col">
        <div className="mb-3 flex items-center justify-between border-b border-[#28382c] pb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#f4f1ea] font-mono">
            <Code className="h-4 w-4 text-[#e9c46a]" />
            <span>./workspace</span>
          </div>
          <button
            onClick={fetchFiles}
            title="Refresh Files"
            className="rounded p-1 text-[#ded8cc] hover:text-[#e9c46a] hover:bg-[#202c22] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {files.length > 0 ? (
            renderTree(files)
          ) : (
            <p className="text-center text-xs text-[#7e8c81] font-mono py-8">
              No files yet in /workspace
            </p>
          )}
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="flex-1 flex flex-col bg-[#0d130f] overflow-hidden">
        {/* Code Header */}
        <div className="flex items-center justify-between border-b border-[#28382c] bg-[#162119] px-4 py-2">
          <div className="flex items-center gap-2 font-mono text-xs text-[#f4f1ea]">
            <FileText className="h-3.5 w-3.5 text-[#e9c46a]" />
            <span className="font-semibold">{selectedFile || 'Select a file'}</span>
          </div>
          {selectedFile && (
            <button
              onClick={copyContent}
              className="flex items-center gap-1 rounded border border-[#324536] bg-[#1a251e] px-2.5 py-1 text-[11px] text-[#ded8cc] hover:text-[#f4f1ea] hover:bg-[#253529]"
            >
              {copied ? <Check className="h-3 w-3 text-[#52b788]" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

        {/* Code Body */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs text-[#f5f2eb] leading-relaxed">
          {loadingContent ? (
            <div className="flex h-full items-center justify-center text-[#7e8c81]">
              Loading file contents...
            </div>
          ) : (
            <pre className="text-[#f5f2eb]">
              <code>{fileContent}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

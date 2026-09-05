'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { OfficeState, MailboxMessage, FileTreeNode } from '../lib/types';
import { getSocket, startPrompt, pauseTeam, resumeTeam, resetSandbox } from '../lib/socket';
import { getClientOrchestrator } from '../lib/simulationEngine';

export function useOfficeState() {
  const orchestrator = useRef(getClientOrchestrator()).current;
  const [officeState, setOfficeState] = useState<OfficeState>(orchestrator.getState());
  const [mailbox, setMailbox] = useState<MailboxMessage[]>(orchestrator.getMailbox());
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>('pm');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isClientSimulation, setIsClientSimulation] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const socket = getSocket();

    // Fallback timer: if socket doesn't connect within 1500ms, use client-side simulation engine
    const fallbackTimer = setTimeout(() => {
      if (!socket.connected && active) {
        setIsClientSimulation(true);
      }
    }, 1500);

    // Subscribe to client-side orchestrator as baseline
    const unsubSimState = orchestrator.subscribeState((state) => {
      if (active && (!socket.connected || isClientSimulation)) {
        setOfficeState({ ...state });
      }
    });

    const unsubSimMailbox = orchestrator.subscribeMailbox((msg) => {
      if (active && (!socket.connected || isClientSimulation)) {
        setMailbox((prev) => [msg, ...prev]);
      }
    });

    // Socket Event Handlers
    const handleConnect = () => {
      if (!active) return;
      setIsConnected(true);
      setIsClientSimulation(false);
      clearTimeout(fallbackTimer);
    };

    const handleDisconnect = () => {
      if (!active) return;
      setIsConnected(false);
      setIsClientSimulation(true);
    };

    const handleStateSync = (state: OfficeState) => {
      if (active) setOfficeState(state);
    };

    const handleStateUpdate = (state: OfficeState) => {
      if (active) setOfficeState(state);
    };

    const handleMailboxSync = (messages: MailboxMessage[]) => {
      if (active) setMailbox(messages);
    };

    const handleMailboxMessage = (msg: MailboxMessage) => {
      if (active) setMailbox((prev) => [msg, ...prev]);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('office:state:sync', handleStateSync);
    socket.on('office:state:update', handleStateUpdate);
    socket.on('mailbox:sync', handleMailboxSync);
    socket.on('mailbox:message', handleMailboxMessage);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      active = false;
      clearTimeout(fallbackTimer);
      unsubSimState();
      unsubSimMailbox();
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('office:state:sync', handleStateSync);
      socket.off('office:state:update', handleStateUpdate);
      socket.off('mailbox:sync', handleMailboxSync);
      socket.off('mailbox:message', handleMailboxMessage);
    };
  }, [orchestrator, isClientSimulation]);

  const handleStartPrompt = useCallback(
    (prompt: string) => {
      const socket = getSocket();
      if (socket.connected && !isClientSimulation) {
        startPrompt(prompt);
      } else {
        orchestrator.startSprint(prompt);
      }
    },
    [isClientSimulation, orchestrator]
  );

  const handleTogglePause = useCallback(() => {
    const socket = getSocket();
    if (socket.connected && !isClientSimulation) {
      if (officeState?.metrics.isPaused) {
        resumeTeam();
      } else {
        pauseTeam();
      }
    } else {
      orchestrator.togglePause();
    }
  }, [isClientSimulation, officeState?.metrics.isPaused, orchestrator]);

  const handleReset = useCallback(() => {
    const socket = getSocket();
    if (socket.connected && !isClientSimulation) {
      resetSandbox();
    } else {
      orchestrator.reset();
    }
  }, [isClientSimulation, orchestrator]);

  const getWorkspaceFiles = useCallback(async (): Promise<FileTreeNode[]> => {
    const socket = getSocket();
    if (socket.connected && !isClientSimulation) {
      try {
        const res = await fetch('http://localhost:4000/api/workspace/files');
        const data = await res.json();
        if (data.success && data.files) return data.files;
      } catch {}
    }
    return orchestrator.listFiles();
  }, [isClientSimulation, orchestrator]);

  const getWorkspaceContent = useCallback(
    async (relativePath: string): Promise<string> => {
      const socket = getSocket();
      if (socket.connected && !isClientSimulation) {
        try {
          const res = await fetch(
            `http://localhost:4000/api/workspace/content?file=${encodeURIComponent(
              relativePath
            )}`
          );
          const data = await res.json();
          if (data.success && data.content !== undefined) return data.content;
        } catch {}
      }
      return orchestrator.readFile(relativePath);
    },
    [isClientSimulation, orchestrator]
  );

  return {
    officeState,
    mailbox,
    selectedAgentId,
    setSelectedAgentId,
    isConnected: isConnected && !isClientSimulation,
    isClientSimulation,
    startSprint: handleStartPrompt,
    togglePause: handleTogglePause,
    resetOffice: handleReset,
    getWorkspaceFiles,
    getWorkspaceContent,
  };
}

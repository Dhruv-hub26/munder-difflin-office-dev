'use client';

import { useEffect, useState, useCallback } from 'react';
import { OfficeState, MailboxMessage } from '../lib/types';
import { getSocket, startPrompt, pauseTeam, resumeTeam, resetSandbox } from '../lib/socket';

export function useOfficeState() {
  const [officeState, setOfficeState] = useState<OfficeState | null>(null);
  const [mailbox, setMailbox] = useState<MailboxMessage[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>('pm');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleStateSync = (state: OfficeState) => {
      setOfficeState(state);
    };

    const handleStateUpdate = (state: OfficeState) => {
      setOfficeState(state);
    };

    const handleMailboxSync = (messages: MailboxMessage[]) => {
      setMailbox(messages);
    };

    const handleMailboxMessage = (msg: MailboxMessage) => {
      setMailbox((prev) => [msg, ...prev]);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('office:state:sync', handleStateSync);
    socket.on('office:state:update', handleStateUpdate);
    socket.on('mailbox:sync', handleMailboxSync);
    socket.on('mailbox:message', handleMailboxMessage);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('office:state:sync', handleStateSync);
      socket.off('office:state:update', handleStateUpdate);
      socket.off('mailbox:sync', handleMailboxSync);
      socket.off('mailbox:message', handleMailboxMessage);
    };
  }, []);

  const handleStartPrompt = useCallback((prompt: string) => {
    startPrompt(prompt);
  }, []);

  const handleTogglePause = useCallback(() => {
    if (officeState?.metrics.isPaused) {
      resumeTeam();
    } else {
      pauseTeam();
    }
  }, [officeState?.metrics.isPaused]);

  const handleReset = useCallback(() => {
    resetSandbox();
  }, []);

  return {
    officeState,
    mailbox,
    selectedAgentId,
    setSelectedAgentId,
    isConnected,
    startSprint: handleStartPrompt,
    togglePause: handleTogglePause,
    resetOffice: handleReset,
  };
}

import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      (typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:4000`
        : 'http://localhost:4000');

    socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to backend orchestrator:', socketInstance?.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket] Connection warning:', err.message);
    });
  }

  return socketInstance;
}

export function startPrompt(prompt: string): void {
  const socket = getSocket();
  socket.emit('action:start_prompt', { prompt });
}

export function pauseTeam(): void {
  const socket = getSocket();
  socket.emit('action:pause');
}

export function resumeTeam(): void {
  const socket = getSocket();
  socket.emit('action:resume');
}

export function resetSandbox(): void {
  const socket = getSocket();
  socket.emit('action:reset');
}

export function sendTerminalInput(agentId: string, input: string): void {
  const socket = getSocket();
  socket.emit('terminal:input', { agentId, input });
}

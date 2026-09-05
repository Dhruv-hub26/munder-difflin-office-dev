import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Orchestrator } from '../core/Orchestrator.js';

export function setupSocketServer(httpServer: HTTPServer, orchestrator: Orchestrator): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Subscribe to state manager changes and broadcast
  orchestrator.stateManager.subscribe((state) => {
    io.emit('office:state:update', state);
  });

  // Subscribe to orchestrator terminal streaming and broadcast
  orchestrator.onTerminalChunk((agentId, chunk) => {
    io.emit('terminal:chunk', { agentId, chunk });
  });

  // Subscribe to mailbox changes
  orchestrator.mailbox.subscribeGlobal((message) => {
    io.emit('mailbox:message', message);
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Send initial complete state immediately
    socket.emit('office:state:sync', orchestrator.stateManager.getState());
    socket.emit('mailbox:sync', orchestrator.mailbox.getAllMessages());

    // User triggers a new feature prompt
    socket.on('action:start_prompt', async (data: { prompt: string }) => {
      console.log(`[Socket.io] Received start_prompt: "${data?.prompt}"`);
      if (data?.prompt) {
        // Run in background without blocking socket event loop
        orchestrator.startProject(data.prompt).catch((err) => {
          console.error('[Socket.io] Start project error:', err);
        });
      }
    });

    // Pause / Resume
    socket.on('action:pause', () => {
      console.log('[Socket.io] Received pause');
      orchestrator.pause();
    });

    socket.on('action:resume', () => {
      console.log('[Socket.io] Received resume');
      orchestrator.resume();
    });

    // Reset Sandbox
    socket.on('action:reset', async () => {
      console.log('[Socket.io] Received reset');
      await orchestrator.resetSandbox();
    });

    // Manual Agent terminal input from xterm
    socket.on('terminal:input', (data: { agentId: string; input: string }) => {
      // Echo or feed to runner if needed
      io.emit('terminal:chunk', {
        agentId: data.agentId,
        chunk: data.input,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  // Heartbeat interval for uptime and metric ticks
  setInterval(() => {
    io.emit('office:heartbeat', {
      uptime: orchestrator.stateManager.getState().metrics.uptimeSeconds,
    });
  }, 2000);

  return io;
}

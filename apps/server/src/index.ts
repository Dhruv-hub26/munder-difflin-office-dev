import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Orchestrator } from './core/Orchestrator.js';
import { setupSocketServer } from './sockets/socketServer.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = parseInt(process.env.PORT || '4000', 10);

app.use(cors());
app.use(express.json());

// Initialize Orchestrator and WebSocket
const orchestrator = new Orchestrator();
setupSocketServer(httpServer, orchestrator);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'MunderDifflin / OfficeDev Backend',
    timestamp: Date.now(),
    uptime: orchestrator.stateManager.getState().metrics.uptimeSeconds,
  });
});

// Full state snapshot
app.get('/api/state', (req, res) => {
  res.json(orchestrator.stateManager.getState());
});

// Workspace files tree
app.get('/api/workspace/files', async (req, res) => {
  try {
    const files = await orchestrator.sandbox.listFiles();
    res.json({ success: true, files });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Workspace file content
app.get('/api/workspace/content', async (req, res) => {
  const filePath = req.query.file as string;
  if (!filePath) {
    return res.status(400).json({ error: 'Query parameter "file" is required' });
  }

  try {
    const content = await orchestrator.sandbox.readFile(filePath);
    res.json({ success: true, file: filePath, content });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// HTTP Action trigger for prompts
app.post('/api/action/start', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  orchestrator.startProject(prompt).catch((err) => {
    console.error('[API] Error starting project:', err);
  });

  res.json({ success: true, message: `Sprint started for: "${prompt}"` });
});

// HTTP Action trigger for reset
app.post('/api/action/reset', async (req, res) => {
  await orchestrator.resetSandbox();
  res.json({ success: true, message: 'Office state and workspace reset.' });
});

httpServer.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │   🏢  MUNDER-DIFFLIN // OFFICEDEV BACKEND ORCHESTRATOR      │
  │                                                             │
  │   - HTTP API:      http://localhost:${PORT}                     │
  │   - WebSocket:     ws://localhost:${PORT}                       │
  │   - Target Sandbox: ${orchestrator.sandbox.getWorkspacePath()}
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
  `);
});

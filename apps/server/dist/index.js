"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const Orchestrator_js_1 = require("./core/Orchestrator.js");
const socketServer_js_1 = require("./sockets/socketServer.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = parseInt(process.env.PORT || '4000', 10);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize Orchestrator and WebSocket
const orchestrator = new Orchestrator_js_1.Orchestrator();
(0, socketServer_js_1.setupSocketServer)(httpServer, orchestrator);
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
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// Workspace file content
app.get('/api/workspace/content', async (req, res) => {
    const filePath = req.query.file;
    if (!filePath) {
        return res.status(400).json({ error: 'Query parameter "file" is required' });
    }
    try {
        const content = await orchestrator.sandbox.readFile(filePath);
        res.json({ success: true, file: filePath, content });
    }
    catch (err) {
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

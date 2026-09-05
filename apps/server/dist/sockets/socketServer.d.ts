import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Orchestrator } from '../core/Orchestrator.js';
export declare function setupSocketServer(httpServer: HTTPServer, orchestrator: Orchestrator): SocketIOServer;

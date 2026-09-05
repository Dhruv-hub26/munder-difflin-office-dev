import { StateManager } from './StateManager.js';
import { Mailbox } from './Mailbox.js';
import { SandboxExecutor } from '../runners/SandboxExecutor.js';
import { PlannerAgent } from '../agents/PlannerAgent.js';
import { CoderAgent } from '../agents/CoderAgent.js';
import { ReviewerAgent } from '../agents/ReviewerAgent.js';
import { DevOpsAgent } from '../agents/DevOpsAgent.js';
import { BaseAgent } from '../agents/BaseAgent.js';
export declare class Orchestrator {
    stateManager: StateManager;
    mailbox: Mailbox;
    sandbox: SandboxExecutor;
    planner: PlannerAgent;
    coder: CoderAgent;
    reviewer: ReviewerAgent;
    devops: DevOpsAgent;
    private agents;
    private isRunning;
    private terminalListeners;
    constructor(workspacePath?: string);
    onTerminalChunk(listener: (agentId: string, chunk: string) => void): () => void;
    private emitTerminalChunk;
    startProject(userPrompt: string): Promise<void>;
    pause(): void;
    resume(): void;
    resetSandbox(): Promise<void>;
    getAgent(id: string): BaseAgent | undefined;
}

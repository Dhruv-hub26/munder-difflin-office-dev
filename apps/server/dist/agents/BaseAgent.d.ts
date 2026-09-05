import { Mailbox, MailboxMessage, MessageType } from '../core/Mailbox.js';
import { AgentRole, AgentStatus, Coordinates, StateManager } from '../core/StateManager.js';
import { SandboxExecutor } from '../runners/SandboxExecutor.js';
export declare abstract class BaseAgent {
    id: string;
    name: string;
    role: AgentRole;
    title: string;
    persona: string;
    protected stateManager: StateManager;
    protected mailbox: Mailbox;
    protected sandbox: SandboxExecutor;
    protected terminalEmitter?: (agentId: string, chunk: string) => void;
    constructor(id: string, name: string, role: AgentRole, title: string, persona: string, stateManager: StateManager, mailbox: Mailbox, sandbox: SandboxExecutor);
    setTerminalEmitter(emitter: (agentId: string, chunk: string) => void): void;
    getCoordinates(): Coordinates;
    getHomeCoordinates(): Coordinates;
    setAction(action: string, status?: AgentStatus): void;
    setStatus(status: AgentStatus): void;
    log(text: string, level?: 'info' | 'warn' | 'error' | 'success'): void;
    streamTerminal(chunk: string): void;
    consumeTokens(count: number): void;
    walkTo(target: Coordinates, steps?: number, intervalMs?: number): Promise<void>;
    returnHome(): Promise<void>;
    sleep(ms: number): Promise<void>;
    sendMessage(to: string, subject: string, content: string, type?: MessageType, taskId?: string): void;
    protected abstract handleIncomingMessage(message: MailboxMessage): Promise<void> | void;
}

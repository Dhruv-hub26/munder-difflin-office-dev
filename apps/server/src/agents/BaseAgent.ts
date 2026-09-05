import { Mailbox, MailboxMessage, MessageType } from '../core/Mailbox.js';
import { AgentRole, AgentStatus, Coordinates, StateManager } from '../core/StateManager.js';
import { SandboxExecutor } from '../runners/SandboxExecutor.js';

export abstract class BaseAgent {
  public id: string;
  public name: string;
  public role: AgentRole;
  public title: string;
  public persona: string;

  protected stateManager: StateManager;
  protected mailbox: Mailbox;
  protected sandbox: SandboxExecutor;
  protected terminalEmitter?: (agentId: string, chunk: string) => void;

  constructor(
    id: string,
    name: string,
    role: AgentRole,
    title: string,
    persona: string,
    stateManager: StateManager,
    mailbox: Mailbox,
    sandbox: SandboxExecutor
  ) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.title = title;
    this.persona = persona;
    this.stateManager = stateManager;
    this.mailbox = mailbox;
    this.sandbox = sandbox;

    // Listen for incoming mailbox messages
    this.mailbox.subscribe(this.id, (message) => {
      this.handleIncomingMessage(message);
    });
  }

  public setTerminalEmitter(emitter: (agentId: string, chunk: string) => void): void {
    this.terminalEmitter = emitter;
  }

  public getCoordinates(): Coordinates {
    const agent = this.stateManager.getAgent(this.id);
    return agent?.coordinates || { x: 0, y: 0 };
  }

  public getHomeCoordinates(): Coordinates {
    const agent = this.stateManager.getAgent(this.id);
    return agent?.homeCoordinates || { x: 0, y: 0 };
  }

  public setAction(action: string, status?: AgentStatus): void {
    this.stateManager.setAgentAction(this.id, action, status);
  }

  public setStatus(status: AgentStatus): void {
    const agent = this.stateManager.getAgent(this.id);
    if (agent) {
      this.stateManager.updateAgent(this.id, { status });
    }
  }

  public log(text: string, level: 'info' | 'warn' | 'error' | 'success' = 'info'): void {
    this.stateManager.addLog(this.id, this.name, text, level);
    this.streamTerminal(`\x1b[38;5;245m[${new Date().toLocaleTimeString()}]\x1b[0m ${text}\r\n`);
  }

  public streamTerminal(chunk: string): void {
    if (this.terminalEmitter) {
      this.terminalEmitter(this.id, chunk);
    }
  }

  public consumeTokens(count: number): void {
    this.stateManager.addTokens(this.id, count);
  }

  public async walkTo(target: Coordinates, steps: number = 10, intervalMs: number = 80): Promise<void> {
    const current = this.getCoordinates();
    this.setStatus('WALKING');

    const dx = (target.x - current.x) / steps;
    const dy = (target.y - current.y) / steps;

    for (let i = 1; i <= steps; i++) {
      const nextX = Math.round(current.x + dx * i);
      const nextY = Math.round(current.y + dy * i);
      this.stateManager.setAgentCoordinates(this.id, { x: nextX, y: nextY });
      this.stateManager.moveAgent(this.id, target);
      await this.sleep(intervalMs);
    }

    this.stateManager.setAgentCoordinates(this.id, target);
  }

  public async returnHome(): Promise<void> {
    const home = this.getHomeCoordinates();
    await this.walkTo(home, 12, 60);
    this.setStatus('IDLE');
    this.setAction('At workstation', 'IDLE');
  }

  public async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public sendMessage(
    to: string,
    subject: string,
    content: string,
    type: MessageType = 'GENERAL',
    taskId?: string
  ): void {
    this.mailbox.send(this.id, to, subject, content, type, taskId);
    this.log(`Sent message to ${to}: "${subject}"`, 'info');
  }

  protected abstract handleIncomingMessage(message: MailboxMessage): Promise<void> | void;
}

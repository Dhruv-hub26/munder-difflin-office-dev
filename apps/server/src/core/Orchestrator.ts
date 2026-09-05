import { StateManager } from './StateManager.js';
import { Mailbox } from './Mailbox.js';
import { SandboxExecutor } from '../runners/SandboxExecutor.js';
import { PlannerAgent } from '../agents/PlannerAgent.js';
import { CoderAgent } from '../agents/CoderAgent.js';
import { ReviewerAgent } from '../agents/ReviewerAgent.js';
import { DevOpsAgent } from '../agents/DevOpsAgent.js';
import { BaseAgent } from '../agents/BaseAgent.js';

export class Orchestrator {
  public stateManager: StateManager;
  public mailbox: Mailbox;
  public sandbox: SandboxExecutor;

  public planner: PlannerAgent;
  public coder: CoderAgent;
  public reviewer: ReviewerAgent;
  public devops: DevOpsAgent;

  private agents: Record<string, BaseAgent>;
  private isRunning: boolean = false;
  private terminalListeners: Array<(agentId: string, chunk: string) => void> = [];

  constructor(workspacePath?: string) {
    this.stateManager = new StateManager();
    this.mailbox = new Mailbox();
    this.sandbox = new SandboxExecutor(workspacePath);

    // Initialize the 4 specialized agents
    this.planner = new PlannerAgent(
      'pm',
      "Michael 'PM' Scott",
      'PLANNER',
      'Lead Architect & Sprint Planner',
      'Visionary product lead. Deconstructs requirements into atomic milestones.',
      this.stateManager,
      this.mailbox,
      this.sandbox
    );

    this.coder = new CoderAgent(
      'coder',
      "Jim 'Fullstack' Halpert",
      'CODER',
      'Senior Full-Stack Engineer',
      'Elite developer. Writes type-safe TypeScript, Next.js components, and backend handlers.',
      this.stateManager,
      this.mailbox,
      this.sandbox
    );

    this.reviewer = new ReviewerAgent(
      'reviewer',
      "Dwight 'QA' Schrute",
      'REVIEWER',
      'Staff Security & QA Reviewer',
      'Quality gatekeeper. Audits diffs, runs penetration tests, enforces strict standards.',
      this.stateManager,
      this.mailbox,
      this.sandbox
    );

    this.devops = new DevOpsAgent(
      'devops',
      "Pam 'DevOps' Beesly",
      'DEVOPS',
      'Lead SRE & Release Engineer',
      'CI/CD master. Manages sandbox runners, git merges, automated testing, and deployments.',
      this.stateManager,
      this.mailbox,
      this.sandbox
    );

    this.agents = {
      pm: this.planner,
      coder: this.coder,
      reviewer: this.reviewer,
      devops: this.devops,
    };

    // Attach terminal streaming handler to all agents
    for (const agent of Object.values(this.agents)) {
      agent.setTerminalEmitter((agentId, chunk) => {
        this.emitTerminalChunk(agentId, chunk);
      });
    }
  }

  public onTerminalChunk(listener: (agentId: string, chunk: string) => void): () => void {
    this.terminalListeners.push(listener);
    return () => {
      this.terminalListeners = this.terminalListeners.filter((l) => l !== listener);
    };
  }

  private emitTerminalChunk(agentId: string, chunk: string): void {
    for (const listener of this.terminalListeners) {
      try {
        listener(agentId, chunk);
      } catch (err) {
        console.error('[Orchestrator] Terminal listener error:', err);
      }
    }
  }

  public async startProject(userPrompt: string): Promise<void> {
    if (this.isRunning) {
      console.warn('[Orchestrator] Project already in flight.');
      return;
    }

    this.isRunning = true;
    this.stateManager.setProject(userPrompt);

    this.emitTerminalChunk(
      'pm',
      `\r\n\x1b[1;32m🚀 [OFFICEDEV] Launching Sprint: "${userPrompt}"\x1b[0m\r\n`
    );

    try {
      // Step 1: Planner breaks down user prompt
      const tasks = await this.planner.planSprint(userPrompt);

      // Tasks will trigger Coder via Mailbox message automatically
      console.log(`[Orchestrator] Sprint planned with ${tasks.length} tasks.`);
    } catch (err) {
      console.error('[Orchestrator] Error during sprint execution:', err);
      this.emitTerminalChunk('pm', `\x1b[31m[ERROR] Sprint execution halted: ${err}\x1b[0m\r\n`);
    } finally {
      this.isRunning = false;
    }
  }

  public pause(): void {
    this.stateManager.setPaused(true);
    for (const agent of Object.values(this.agents)) {
      agent.setAction('PAUSED (Waiting for user resume)', 'IDLE');
    }
  }

  public resume(): void {
    this.stateManager.setPaused(false);
    for (const agent of Object.values(this.agents)) {
      agent.setAction('Resumed active duties', 'IDLE');
    }
  }

  public async resetSandbox(): Promise<void> {
    this.stateManager.reset();
    this.mailbox.clear();

    for (const agent of Object.values(this.agents)) {
      await agent.returnHome();
    }

    this.emitTerminalChunk(
      'pm',
      `\r\n\x1b[1;33m🔄 Sandbox & Office State reset. Ready for new sprint.\x1b[0m\r\n`
    );
  }

  public getAgent(id: string): BaseAgent | undefined {
    return this.agents[id];
  }
}

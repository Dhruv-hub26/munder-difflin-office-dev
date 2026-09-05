import { BaseAgent } from './BaseAgent.js';
import { MailboxMessage } from '../core/Mailbox.js';
import { Task } from '../core/StateManager.js';

export class PlannerAgent extends BaseAgent {
  public async planSprint(userPrompt: string): Promise<Task[]> {
    this.log(`\x1b[34m[SPRINT GOAL RECEIVED]\x1b[0m "${userPrompt}"`, 'info');
    this.streamTerminal(
      `\x1b[1;36m========================================================\x1b[0m\r\n` +
      `\x1b[1;36m📋 INITIATING SPRINT ARCHITECTURE & BREAKDOWN\x1b[0m\r\n` +
      `\x1b[38;5;250mFeature Scope: "${userPrompt}"\x1b[0m\r\n` +
      `\x1b[1;36m========================================================\x1b[0m\r\n`
    );

    this.setAction('Walking to Conference Room...', 'WALKING');
    // Meeting Room waypoint: { x: 180, y: 140 }
    await this.walkTo({ x: 180, y: 140 }, 10, 50);

    this.setStatus('PLANNING');
    this.setAction('Drafting architecture & task specs...', 'PLANNING');
    this.consumeTokens(450);

    await this.sleep(800);
    this.streamTerminal(`\x1b[33m[PM]\x1b[0m Analyzing system dependencies and module topology...\r\n`);
    await this.sleep(600);

    // Generate tailored tasks based on userPrompt or presets
    const generatedTasks: Task[] = this.generateTasksForPrompt(userPrompt);

    for (const task of generatedTasks) {
      this.stateManager.addTask(task);
      this.log(`Created Kanban card: [${task.priority}] "${task.title}"`, 'info');
      this.streamTerminal(`  \x1b[32m✔\x1b[0m Created Task [${task.id}]: \x1b[1m${task.title}\x1b[0m\r\n`);
      await this.sleep(400);
    }

    this.consumeTokens(350);
    this.log(`Sprint planning complete. ${generatedTasks.length} tasks ready in Backlog.`, 'success');
    this.streamTerminal(
      `\x1b[32m✔ Sprint planning finalized.\x1b[0m Notifying Coder Jim Halpert.\r\n`
    );

    // Notify Coder agent
    const firstTask = generatedTasks[0];
    this.sendMessage(
      'coder',
      `Sprint Ready: ${firstTask.title}`,
      `Please claim task "${firstTask.title}" (${firstTask.id}) and begin implementation in ./workspace.`,
      'TASK_ASSIGNED',
      firstTask.id
    );

    await this.sleep(700);
    this.setAction('Returning to desk...', 'WALKING');
    await this.returnHome();

    return generatedTasks;
  }

  private generateTasksForPrompt(prompt: string): Task[] {
    const timestamp = Date.now();
    const clean = prompt.toLowerCase();

    if (clean.includes('analytics') || clean.includes('chart') || clean.includes('metric')) {
      return [
        {
          id: `task-${timestamp}-1`,
          title: 'Implement Analytics Engine & Aggregator',
          description: 'Create real-time event pipeline and aggregation compute modules in src/analytics/engine.ts.',
          status: 'BACKLOG',
          assignedAgentId: 'coder',
          priority: 'HIGH',
          files: ['src/analytics/engine.ts', 'src/analytics/types.ts'],
          createdAt: timestamp,
          reviewNotes: [],
        },
        {
          id: `task-${timestamp}-2`,
          title: 'Build Interactive Metrics Dashboard Widget',
          description: 'Design responsive SVG chart cards with real-time refresh, trends, and hover tooltips.',
          status: 'BACKLOG',
          assignedAgentId: 'coder',
          priority: 'MEDIUM',
          files: ['src/components/AnalyticsWidget.tsx', 'src/components/MetricCard.tsx'],
          createdAt: timestamp + 10,
          reviewNotes: [],
        },
        {
          id: `task-${timestamp}-3`,
          title: 'Telemetry Test Suite & Benchmarks',
          description: 'Write unit tests for latency metrics and bundle size verification under 15kb gzip.',
          status: 'BACKLOG',
          assignedAgentId: 'coder',
          priority: 'MEDIUM',
          files: ['tests/analytics.test.ts'],
          createdAt: timestamp + 20,
          reviewNotes: [],
        },
      ];
    } else if (clean.includes('auth') || clean.includes('login') || clean.includes('security')) {
      return [
        {
          id: `task-${timestamp}-1`,
          title: 'Setup JWT & Argon2 Security Session Store',
          description: 'Create encrypted session handler with refresh token rotation and rate limiting.',
          status: 'BACKLOG',
          assignedAgentId: 'coder',
          priority: 'CRITICAL',
          files: ['src/auth/session.ts', 'src/auth/crypto.ts'],
          createdAt: timestamp,
          reviewNotes: [],
        },
        {
          id: `task-${timestamp}-2`,
          title: 'Build Cyberpunk Login & MFA Modal Component',
          description: 'Craft high-fidelity dark mode authentication form with biometric fallback.',
          status: 'BACKLOG',
          assignedAgentId: 'coder',
          priority: 'HIGH',
          files: ['src/components/LoginForm.tsx', 'src/components/MfaChallenge.tsx'],
          createdAt: timestamp + 10,
          reviewNotes: [],
        },
        {
          id: `task-${timestamp}-3`,
          title: 'Penetration & CSRF Security Audit',
          description: 'Verify CSP headers, cookie flags (HttpOnly/SameSite), and brute-force lockouts.',
          status: 'BACKLOG',
          assignedAgentId: 'coder',
          priority: 'HIGH',
          files: ['tests/auth.spec.ts'],
          createdAt: timestamp + 20,
          reviewNotes: [],
        },
      ];
    } else {
      // General feature implementation
      return [
        {
          id: `task-${timestamp}-1`,
          title: `Scaffold Architecture for "${prompt.slice(0, 35)}"`,
          description: `Initialize data models, type definitions, and schema contracts in ./workspace.`,
          status: 'BACKLOG',
          assignedAgentId: 'coder',
          priority: 'HIGH',
          files: ['src/core/schema.ts', 'src/core/types.ts'],
          createdAt: timestamp,
          reviewNotes: [],
        },
        {
          id: `task-${timestamp}-2`,
          title: 'Implement Core Feature Logic & Handlers',
          description: `Write business logic, state machines, and API endpoints for ${prompt.slice(0, 30)}.`,
          status: 'BACKLOG',
          assignedAgentId: 'coder',
          priority: 'HIGH',
          files: ['src/modules/feature.ts', 'src/api/handler.ts'],
          createdAt: timestamp + 10,
          reviewNotes: [],
        },
        {
          id: `task-${timestamp}-3`,
          title: 'Fullstack Integration Tests & Smoke Checks',
          description: 'End-to-end integration tests, regression checks, and performance benchmarks.',
          status: 'BACKLOG',
          assignedAgentId: 'coder',
          priority: 'MEDIUM',
          files: ['tests/feature.test.ts'],
          createdAt: timestamp + 20,
          reviewNotes: [],
        },
      ];
    }
  }

  protected async handleIncomingMessage(message: MailboxMessage): Promise<void> {
    if (message.type === 'STATUS_UPDATE') {
      this.log(`PM acknowledged: ${message.subject}`, 'info');
    }
  }
}

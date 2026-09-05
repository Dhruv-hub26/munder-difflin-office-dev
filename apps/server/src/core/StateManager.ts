import { MailboxMessage } from './Mailbox.js';

export type AgentRole = 'PLANNER' | 'CODER' | 'REVIEWER' | 'DEVOPS';
export type AgentStatus =
  | 'IDLE'
  | 'PLANNING'
  | 'CODING'
  | 'TESTING'
  | 'DEPLOYING'
  | 'ERROR'
  | 'WALKING';

export interface AvatarConfig {
  skinColor: string;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  accessory?: string;
  hairStyle?: string;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  title: string;
  persona: string;
  status: AgentStatus;
  avatarConfig: AvatarConfig;
  coordinates: Coordinates;
  targetCoordinates: Coordinates;
  homeCoordinates: Coordinates;
  currentAction: string;
  currentTaskId: string | null;
  tokensUsed: number;
  costUsd: number;
  logs: string[];
}

export type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedAgentId: string | null;
  priority: TaskPriority;
  files: string[];
  diff?: string | null;
  createdAt: number;
  completedAt?: number | null;
  testResults?: { passed: boolean; output: string } | null;
  reviewNotes: string[];
}

export interface GlobalMetrics {
  totalTokens: number;
  totalCost: number;
  activeAgents: number;
  completedTasks: number;
  totalTasks: number;
  uptimeSeconds: number;
  gitBranch: string;
  currentProject: string;
  isPaused: boolean;
}

export interface OfficeState {
  agents: Record<string, Agent>;
  tasks: Task[];
  metrics: GlobalMetrics;
  recentLogs: Array<{
    id: string;
    agentId: string;
    agentName: string;
    text: string;
    timestamp: number;
    level: 'info' | 'warn' | 'error' | 'success';
  }>;
}

export class StateManager {
  private state: OfficeState;
  private startTime: number;
  private changeListeners: Array<(state: OfficeState) => void> = [];

  constructor() {
    this.startTime = Date.now();
    this.state = this.getInitialState();
  }

  private getInitialState(): OfficeState {
    const agents: Record<string, Agent> = {
      pm: {
        id: 'pm',
        name: "Michael 'PM' Scott",
        role: 'PLANNER',
        title: 'Lead Architect & Sprint Planner',
        persona:
          'Visionary product lead. Breaks down ambitious software requirements into precise, dependency-ordered technical specifications and backlog items.',
        status: 'IDLE',
        avatarConfig: {
          skinColor: '#F5D0A9',
          hairColor: '#2D3748',
          shirtColor: '#3B82F6', // Blue suit
          pantsColor: '#1E293B',
          accessory: 'tie',
          hairStyle: 'slick',
        },
        coordinates: { x: 260, y: 190 },
        targetCoordinates: { x: 260, y: 190 },
        homeCoordinates: { x: 260, y: 190 },
        currentAction: 'Reviewing roadmap',
        currentTaskId: null,
        tokensUsed: 1420,
        costUsd: 0.0042,
        logs: ['[PM] System initialized. Ready to plan new sprints.'],
      },
      coder: {
        id: 'coder',
        name: "Jim 'Fullstack' Halpert",
        role: 'CODER',
        title: 'Senior Full-Stack Engineer',
        persona:
          'Elite 10x developer. Crafts clean, modular TypeScript, Next.js components, and backend microservices with rigorous type safety.',
        status: 'IDLE',
        avatarConfig: {
          skinColor: '#FCD34D',
          hairColor: '#78350F',
          shirtColor: '#10B981', // Emerald green
          pantsColor: '#334155',
          accessory: 'headphones',
          hairStyle: 'messy',
        },
        coordinates: { x: 420, y: 190 },
        targetCoordinates: { x: 420, y: 190 },
        homeCoordinates: { x: 420, y: 190 },
        currentAction: 'Idle at workstation',
        currentTaskId: null,
        tokensUsed: 2150,
        costUsd: 0.0064,
        logs: ['[CODER] Workspace loaded. Ready to build features.'],
      },
      reviewer: {
        id: 'reviewer',
        name: "Dwight 'QA' Schrute",
        role: 'REVIEWER',
        title: 'Staff Security & QA Reviewer',
        persona:
          'Ruthless quality gatekeeper. Audits every diff, scans for edge case vulnerabilities, validates test suites, and enforces architectural standards.',
        status: 'IDLE',
        avatarConfig: {
          skinColor: '#FDE68A',
          hairColor: '#451A03',
          shirtColor: '#F59E0B', // Mustard yellow
          pantsColor: '#1F2937',
          accessory: 'glasses',
          hairStyle: 'parted',
        },
        coordinates: { x: 580, y: 190 },
        targetCoordinates: { x: 580, y: 190 },
        homeCoordinates: { x: 580, y: 190 },
        currentAction: 'Checking quality gates',
        currentTaskId: null,
        tokensUsed: 980,
        costUsd: 0.0029,
        logs: ['[REVIEWER] Security and lint monitors online.'],
      },
      devops: {
        id: 'devops',
        name: "Pam 'DevOps' Beesly",
        role: 'DEVOPS',
        title: 'Lead SRE & Release Engineer',
        persona:
          'Automation and platform master. Manages Git branching, builds Docker containers, executes test runners, and coordinates zero-downtime releases.',
        status: 'IDLE',
        avatarConfig: {
          skinColor: '#FED7AA',
          hairColor: '#B45309',
          shirtColor: '#EC4899', // Pink / magenta
          pantsColor: '#0F172A',
          accessory: 'badge',
          hairStyle: 'ponytail',
        },
        coordinates: { x: 740, y: 280 },
        targetCoordinates: { x: 740, y: 280 },
        homeCoordinates: { x: 740, y: 280 },
        currentAction: 'Monitoring server telemetry',
        currentTaskId: null,
        tokensUsed: 1200,
        costUsd: 0.0036,
        logs: ['[DEVOPS] CI/CD runner listening for commits.'],
      },
    };

    const initialTasks: Task[] = [
      {
        id: 'task-101',
        title: 'Initialize Workspace Core & Routing',
        description: 'Set up file structure, environment configs, and routing engine in ./workspace.',
        status: 'DONE',
        assignedAgentId: 'coder',
        priority: 'HIGH',
        files: ['workspace/package.json', 'workspace/README.md'],
        createdAt: Date.now() - 3600000,
        completedAt: Date.now() - 3200000,
        testResults: { passed: true, output: '100% test coverage passed.' },
        reviewNotes: ['Clean foundation, approved.'],
      },
      {
        id: 'task-102',
        title: 'Setup High-Speed Event Bus & Telemetry',
        description: 'Implement real-time agent state sync and terminal log streaming.',
        status: 'DONE',
        assignedAgentId: 'devops',
        priority: 'MEDIUM',
        files: ['src/core/StateManager.ts'],
        createdAt: Date.now() - 3000000,
        completedAt: Date.now() - 2500000,
        testResults: { passed: true, output: 'Latency < 5ms over local socket.' },
        reviewNotes: ['Telemetry verified.'],
      },
    ];

    return {
      agents,
      tasks: initialTasks,
      metrics: {
        totalTokens: 5750,
        totalCost: 0.0171,
        activeAgents: 0,
        completedTasks: 2,
        totalTasks: 2,
        uptimeSeconds: 0,
        gitBranch: 'main',
        currentProject: 'MunderDifflin / Core Workspace',
        isPaused: false,
      },
      recentLogs: [
        {
          id: 'log-1',
          agentId: 'pm',
          agentName: "Michael 'PM' Scott",
          text: 'OfficeDev platform initialized. Ready for sprint goals.',
          timestamp: Date.now() - 10000,
          level: 'info',
        },
      ],
    };
  }

  public getState(): OfficeState {
    this.state.metrics.uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    return this.state;
  }

  public getAgent(id: string): Agent | undefined {
    return this.state.agents[id];
  }

  public updateAgent(id: string, updates: Partial<Agent>): void {
    if (this.state.agents[id]) {
      this.state.agents[id] = {
        ...this.state.agents[id],
        ...updates,
      };
      this.notifyChanges();
    }
  }

  public setAgentAction(id: string, action: string, status?: AgentStatus): void {
    if (this.state.agents[id]) {
      this.state.agents[id].currentAction = action;
      if (status) {
        this.state.agents[id].status = status;
      }
      this.notifyChanges();
    }
  }

  public moveAgent(id: string, target: Coordinates): void {
    if (this.state.agents[id]) {
      this.state.agents[id].targetCoordinates = target;
      this.notifyChanges();
    }
  }

  public setAgentCoordinates(id: string, coords: Coordinates): void {
    if (this.state.agents[id]) {
      this.state.agents[id].coordinates = coords;
      this.notifyChanges();
    }
  }

  public addTokens(agentId: string, tokens: number): void {
    const cost = (tokens / 1000) * 0.003; // ~$0.003 / 1k tokens estimate
    if (this.state.agents[agentId]) {
      this.state.agents[agentId].tokensUsed += tokens;
      this.state.agents[agentId].costUsd += cost;
    }
    this.state.metrics.totalTokens += tokens;
    this.state.metrics.totalCost += cost;
    this.notifyChanges();
  }

  public addTask(task: Task): void {
    this.state.tasks.push(task);
    this.state.metrics.totalTasks = this.state.tasks.length;
    this.notifyChanges();
  }

  public updateTask(id: string, updates: Partial<Task>): void {
    const idx = this.state.tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.state.tasks[idx] = {
        ...this.state.tasks[idx],
        ...updates,
      };
      this.state.metrics.completedTasks = this.state.tasks.filter(
        (t) => t.status === 'DONE'
      ).length;
      this.notifyChanges();
    }
  }

  public getTasks(): Task[] {
    return [...this.state.tasks];
  }

  public addLog(
    agentId: string,
    agentName: string,
    text: string,
    level: 'info' | 'warn' | 'error' | 'success' = 'info'
  ): void {
    const logItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      agentId,
      agentName,
      text,
      timestamp: Date.now(),
      level,
    };
    this.state.recentLogs.unshift(logItem);
    if (this.state.recentLogs.length > 200) {
      this.state.recentLogs.pop();
    }

    if (this.state.agents[agentId]) {
      this.state.agents[agentId].logs.push(text);
      if (this.state.agents[agentId].logs.length > 500) {
        this.state.agents[agentId].logs.shift();
      }
    }

    this.notifyChanges();
  }

  public setPaused(paused: boolean): void {
    this.state.metrics.isPaused = paused;
    this.notifyChanges();
  }

  public setGitBranch(branch: string): void {
    this.state.metrics.gitBranch = branch;
    this.notifyChanges();
  }

  public setProject(name: string): void {
    this.state.metrics.currentProject = name;
    this.notifyChanges();
  }

  public reset(): void {
    this.state = this.getInitialState();
    this.startTime = Date.now();
    this.notifyChanges();
  }

  public subscribe(listener: (state: OfficeState) => void): () => void {
    this.changeListeners.push(listener);
    return () => {
      this.changeListeners = this.changeListeners.filter((l) => l !== listener);
    };
  }

  private notifyChanges(): void {
    // Recount active agents
    const activeCount = Object.values(this.state.agents).filter(
      (a) => a.status !== 'IDLE'
    ).length;
    this.state.metrics.activeAgents = activeCount;

    for (const listener of this.changeListeners) {
      try {
        listener(this.getState());
      } catch (err) {
        console.error('[StateManager] Listener error:', err);
      }
    }
  }
}

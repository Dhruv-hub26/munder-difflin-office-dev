export type AgentRole = 'PLANNER' | 'CODER' | 'REVIEWER' | 'DEVOPS';
export type AgentStatus = 'IDLE' | 'PLANNING' | 'CODING' | 'TESTING' | 'DEPLOYING' | 'ERROR' | 'WALKING';
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
    testResults?: {
        passed: boolean;
        output: string;
    } | null;
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
export declare class StateManager {
    private state;
    private startTime;
    private changeListeners;
    constructor();
    private getInitialState;
    getState(): OfficeState;
    getAgent(id: string): Agent | undefined;
    updateAgent(id: string, updates: Partial<Agent>): void;
    setAgentAction(id: string, action: string, status?: AgentStatus): void;
    moveAgent(id: string, target: Coordinates): void;
    setAgentCoordinates(id: string, coords: Coordinates): void;
    addTokens(agentId: string, tokens: number): void;
    addTask(task: Task): void;
    updateTask(id: string, updates: Partial<Task>): void;
    getTasks(): Task[];
    addLog(agentId: string, agentName: string, text: string, level?: 'info' | 'warn' | 'error' | 'success'): void;
    setPaused(paused: boolean): void;
    setGitBranch(branch: string): void;
    setProject(name: string): void;
    reset(): void;
    subscribe(listener: (state: OfficeState) => void): () => void;
    private notifyChanges;
}

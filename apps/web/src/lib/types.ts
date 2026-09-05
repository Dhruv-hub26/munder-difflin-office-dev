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

export interface Dimensions {
  width: number;
  height: number;
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
  dimensions?: Dimensions;
  currentAction: string;
  actionProgress?: number; // 0 - 100 for tags like "Jim: writing route.ts [74%]"
  currentTaskId: string | null;
  tokensUsed: number;
  costUsd: number;
  logs: string[];
}

export interface RoomZone {
  id: string;
  name: string;
  coordinates: Coordinates;
  dimensions: Dimensions;
  color: string;
}

export interface Furniture {
  id: string;
  name: string;
  coordinates: Coordinates;
  dimensions: Dimensions;
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

export interface LogItem {
  id: string;
  agentId: string;
  agentName: string;
  text: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'success';
}

export interface OfficeState {
  agents: Record<string, Agent>;
  tasks: Task[];
  metrics: GlobalMetrics;
  recentLogs: LogItem[];
  rooms?: Record<string, RoomZone>;
  furniture?: Record<string, Furniture>;
}

export type MessageType =
  | 'TASK_ASSIGNED'
  | 'CODE_REVIEW_REQUEST'
  | 'REVIEW_FEEDBACK'
  | 'DEPLOY_READY'
  | 'STATUS_UPDATE'
  | 'GENERAL';

export interface MailboxMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: number;
  type: MessageType;
  taskId?: string;
  read: boolean;
}

export interface FileTreeNode {
  name: string;
  path: string;
  relativePath: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
  children?: FileTreeNode[];
  content?: string;
}

export type CameraPreset = 'all' | 'jim' | 'server' | 'pm' | 'lounge';

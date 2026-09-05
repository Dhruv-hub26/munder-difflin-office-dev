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

export type MailboxListener = (message: MailboxMessage) => void;

export class Mailbox {
  private messages: MailboxMessage[] = [];
  private listeners: Map<string, MailboxListener[]> = new Map();
  private globalListeners: MailboxListener[] = [];

  constructor() {
    this.messages = [];
  }

  public send(
    from: string,
    to: string,
    subject: string,
    content: string,
    type: MessageType = 'GENERAL',
    taskId?: string
  ): MailboxMessage {
    const message: MailboxMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      from,
      to,
      subject,
      content,
      timestamp: Date.now(),
      type,
      taskId,
      read: false,
    };

    this.messages.push(message);

    // Notify targeted agent listeners
    const targetListeners = this.listeners.get(to) || [];
    for (const listener of targetListeners) {
      try {
        listener(message);
      } catch (err) {
        console.error(`[Mailbox] Error delivering message to ${to}:`, err);
      }
    }

    // Notify broadcast or global listeners
    for (const listener of this.globalListeners) {
      try {
        listener(message);
      } catch (err) {
        console.error(`[Mailbox] Error in global listener:`, err);
      }
    }

    return message;
  }

  public subscribe(agentId: string, listener: MailboxListener): () => void {
    if (!this.listeners.has(agentId)) {
      this.listeners.set(agentId, []);
    }
    this.listeners.get(agentId)!.push(listener);

    return () => {
      const list = this.listeners.get(agentId) || [];
      this.listeners.set(
        agentId,
        list.filter((l) => l !== listener)
      );
    };
  }

  public subscribeGlobal(listener: MailboxListener): () => void {
    this.globalListeners.push(listener);
    return () => {
      this.globalListeners = this.globalListeners.filter((l) => l !== listener);
    };
  }

  public getMessagesForAgent(agentId: string): MailboxMessage[] {
    return this.messages.filter((m) => m.to === agentId || m.to === 'ALL');
  }

  public getAllMessages(): MailboxMessage[] {
    return [...this.messages];
  }

  public markAsRead(messageId: string): void {
    const msg = this.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.read = true;
    }
  }

  public clear(): void {
    this.messages = [];
  }
}

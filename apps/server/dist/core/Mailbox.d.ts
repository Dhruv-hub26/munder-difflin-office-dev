export type MessageType = 'TASK_ASSIGNED' | 'CODE_REVIEW_REQUEST' | 'REVIEW_FEEDBACK' | 'DEPLOY_READY' | 'STATUS_UPDATE' | 'GENERAL';
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
export declare class Mailbox {
    private messages;
    private listeners;
    private globalListeners;
    constructor();
    send(from: string, to: string, subject: string, content: string, type?: MessageType, taskId?: string): MailboxMessage;
    subscribe(agentId: string, listener: MailboxListener): () => void;
    subscribeGlobal(listener: MailboxListener): () => void;
    getMessagesForAgent(agentId: string): MailboxMessage[];
    getAllMessages(): MailboxMessage[];
    markAsRead(messageId: string): void;
    clear(): void;
}

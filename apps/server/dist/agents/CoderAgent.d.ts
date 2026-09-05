import { BaseAgent } from './BaseAgent.js';
import { MailboxMessage } from '../core/Mailbox.js';
import { Task } from '../core/StateManager.js';
export declare class CoderAgent extends BaseAgent {
    executeTask(task: Task): Promise<void>;
    private generateCodeForTask;
    protected handleIncomingMessage(message: MailboxMessage): Promise<void>;
}

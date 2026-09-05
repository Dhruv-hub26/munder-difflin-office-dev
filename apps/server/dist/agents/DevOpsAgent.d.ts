import { BaseAgent } from './BaseAgent.js';
import { MailboxMessage } from '../core/Mailbox.js';
import { Task } from '../core/StateManager.js';
export declare class DevOpsAgent extends BaseAgent {
    deployTask(task: Task): Promise<void>;
    protected handleIncomingMessage(message: MailboxMessage): Promise<void>;
}

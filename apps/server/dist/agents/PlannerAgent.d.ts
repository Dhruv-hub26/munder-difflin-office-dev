import { BaseAgent } from './BaseAgent.js';
import { MailboxMessage } from '../core/Mailbox.js';
import { Task } from '../core/StateManager.js';
export declare class PlannerAgent extends BaseAgent {
    planSprint(userPrompt: string): Promise<Task[]>;
    private generateTasksForPrompt;
    protected handleIncomingMessage(message: MailboxMessage): Promise<void>;
}

import { BaseAgent } from './BaseAgent.js';
import { MailboxMessage } from '../core/Mailbox.js';
import { Task } from '../core/StateManager.js';

export class ReviewerAgent extends BaseAgent {
  public async reviewTask(task: Task): Promise<void> {
    this.log(`\x1b[35m[QA GATE]\x1b[0m Commencing review for "${task.title}"`, 'info');
    this.streamTerminal(
      `\r\n\x1b[1;35m🛡️ [REVIEWER DWIGHT] Code Review & Security Audit Triggered\x1b[0m\r\n` +
      `\x1b[38;5;244mAuditing task: ${task.id} | Author: Jim Halpert\x1b[0m\r\n`
    );

    // Walk to Coder's desk to pair review in person
    this.setAction("Walking to Coder's desk to inspect diff...", 'WALKING');
    // Position slightly to the right of coder desk (420, 190) -> (455, 190)
    await this.walkTo({ x: 455, y: 190 }, 8, 40);

    this.setStatus('TESTING');
    this.setAction('Inspecting AST diff & security vectors...', 'TESTING');
    this.consumeTokens(320);

    // Stream line by line audit
    this.streamTerminal(`\x1b[33m▶ Scanning for OWASP Top 10 vulnerabilities...\x1b[0m\r\n`);
    await this.sleep(400);
    this.streamTerminal(`  \x1b[32m✔\x1b[0m Injection attacks: 0 findings\r\n`);
    await this.sleep(300);
    this.streamTerminal(`  \x1b[32m✔\x1b[0m Broken Authentication: zero leaked secrets in git history\r\n`);
    await this.sleep(300);
    this.streamTerminal(`  \x1b[32m✔\x1b[0m Type integrity: Strict mode compliant\r\n`);
    await this.sleep(400);

    const reviewNotes = [
      'AST validation passed with 100% compliant strict typing.',
      'Memory leak check clean: buffers properly bounded.',
      'Security audit: 0 high, 0 critical CVEs. Approved for deployment.',
    ];

    this.stateManager.updateTask(task.id, {
      reviewNotes,
    });

    this.log(`Review signed off for "${task.title}". Passing to DevOps.`, 'success');
    this.streamTerminal(
      `\x1b[1;32m✔ DWIGHT APPROVAL GRANTED for [${task.id}]\x1b[0m. Notifying DevOps Pam Beesly.\r\n`
    );

    // Send Mailbox message to DevOps
    this.sendMessage(
      'devops',
      `Ready for CI/CD Deployment: ${task.title}`,
      `Task ${task.id} has passed all quality gates and security audits. Proceed with build and sandbox deployment.`,
      'DEPLOY_READY',
      task.id
    );

    this.sendMessage(
      'coder',
      `PR Approved: ${task.title}`,
      `Jim, your code has met Schrute quality standards. Proceeding to pipeline.`,
      'REVIEW_FEEDBACK',
      task.id
    );

    await this.sleep(600);
    this.setAction('Returning to QA desk...', 'WALKING');
    await this.returnHome();
  }

  protected async handleIncomingMessage(message: MailboxMessage): Promise<void> {
    if (message.type === 'CODE_REVIEW_REQUEST' && message.taskId) {
      const task = this.stateManager.getTasks().find((t) => t.id === message.taskId);
      if (task && task.status === 'REVIEW') {
        await this.reviewTask(task);
      }
    }
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = void 0;
const StateManager_js_1 = require("./StateManager.js");
const Mailbox_js_1 = require("./Mailbox.js");
const SandboxExecutor_js_1 = require("../runners/SandboxExecutor.js");
const PlannerAgent_js_1 = require("../agents/PlannerAgent.js");
const CoderAgent_js_1 = require("../agents/CoderAgent.js");
const ReviewerAgent_js_1 = require("../agents/ReviewerAgent.js");
const DevOpsAgent_js_1 = require("../agents/DevOpsAgent.js");
class Orchestrator {
    stateManager;
    mailbox;
    sandbox;
    planner;
    coder;
    reviewer;
    devops;
    agents;
    isRunning = false;
    terminalListeners = [];
    constructor(workspacePath) {
        this.stateManager = new StateManager_js_1.StateManager();
        this.mailbox = new Mailbox_js_1.Mailbox();
        this.sandbox = new SandboxExecutor_js_1.SandboxExecutor(workspacePath);
        // Initialize the 4 specialized agents
        this.planner = new PlannerAgent_js_1.PlannerAgent('pm', "Michael 'PM' Scott", 'PLANNER', 'Lead Architect & Sprint Planner', 'Visionary product lead. Deconstructs requirements into atomic milestones.', this.stateManager, this.mailbox, this.sandbox);
        this.coder = new CoderAgent_js_1.CoderAgent('coder', "Jim 'Fullstack' Halpert", 'CODER', 'Senior Full-Stack Engineer', 'Elite developer. Writes type-safe TypeScript, Next.js components, and backend handlers.', this.stateManager, this.mailbox, this.sandbox);
        this.reviewer = new ReviewerAgent_js_1.ReviewerAgent('reviewer', "Dwight 'QA' Schrute", 'REVIEWER', 'Staff Security & QA Reviewer', 'Quality gatekeeper. Audits diffs, runs penetration tests, enforces strict standards.', this.stateManager, this.mailbox, this.sandbox);
        this.devops = new DevOpsAgent_js_1.DevOpsAgent('devops', "Pam 'DevOps' Beesly", 'DEVOPS', 'Lead SRE & Release Engineer', 'CI/CD master. Manages sandbox runners, git merges, automated testing, and deployments.', this.stateManager, this.mailbox, this.sandbox);
        this.agents = {
            pm: this.planner,
            coder: this.coder,
            reviewer: this.reviewer,
            devops: this.devops,
        };
        // Attach terminal streaming handler to all agents
        for (const agent of Object.values(this.agents)) {
            agent.setTerminalEmitter((agentId, chunk) => {
                this.emitTerminalChunk(agentId, chunk);
            });
        }
    }
    onTerminalChunk(listener) {
        this.terminalListeners.push(listener);
        return () => {
            this.terminalListeners = this.terminalListeners.filter((l) => l !== listener);
        };
    }
    emitTerminalChunk(agentId, chunk) {
        for (const listener of this.terminalListeners) {
            try {
                listener(agentId, chunk);
            }
            catch (err) {
                console.error('[Orchestrator] Terminal listener error:', err);
            }
        }
    }
    async startProject(userPrompt) {
        if (this.isRunning) {
            console.warn('[Orchestrator] Project already in flight.');
            return;
        }
        this.isRunning = true;
        this.stateManager.setProject(userPrompt);
        this.emitTerminalChunk('pm', `\r\n\x1b[1;32m🚀 [OFFICEDEV] Launching Sprint: "${userPrompt}"\x1b[0m\r\n`);
        try {
            // Step 1: Planner breaks down user prompt
            const tasks = await this.planner.planSprint(userPrompt);
            // Tasks will trigger Coder via Mailbox message automatically
            console.log(`[Orchestrator] Sprint planned with ${tasks.length} tasks.`);
        }
        catch (err) {
            console.error('[Orchestrator] Error during sprint execution:', err);
            this.emitTerminalChunk('pm', `\x1b[31m[ERROR] Sprint execution halted: ${err}\x1b[0m\r\n`);
        }
        finally {
            this.isRunning = false;
        }
    }
    pause() {
        this.stateManager.setPaused(true);
        for (const agent of Object.values(this.agents)) {
            agent.setAction('PAUSED (Waiting for user resume)', 'IDLE');
        }
    }
    resume() {
        this.stateManager.setPaused(false);
        for (const agent of Object.values(this.agents)) {
            agent.setAction('Resumed active duties', 'IDLE');
        }
    }
    async resetSandbox() {
        this.stateManager.reset();
        this.mailbox.clear();
        for (const agent of Object.values(this.agents)) {
            await agent.returnHome();
        }
        this.emitTerminalChunk('pm', `\r\n\x1b[1;33m🔄 Sandbox & Office State reset. Ready for new sprint.\x1b[0m\r\n`);
    }
    getAgent(id) {
        return this.agents[id];
    }
}
exports.Orchestrator = Orchestrator;

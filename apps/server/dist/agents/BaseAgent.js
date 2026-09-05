"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
class BaseAgent {
    id;
    name;
    role;
    title;
    persona;
    stateManager;
    mailbox;
    sandbox;
    terminalEmitter;
    constructor(id, name, role, title, persona, stateManager, mailbox, sandbox) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.title = title;
        this.persona = persona;
        this.stateManager = stateManager;
        this.mailbox = mailbox;
        this.sandbox = sandbox;
        // Listen for incoming mailbox messages
        this.mailbox.subscribe(this.id, (message) => {
            this.handleIncomingMessage(message);
        });
    }
    setTerminalEmitter(emitter) {
        this.terminalEmitter = emitter;
    }
    getCoordinates() {
        const agent = this.stateManager.getAgent(this.id);
        return agent?.coordinates || { x: 0, y: 0 };
    }
    getHomeCoordinates() {
        const agent = this.stateManager.getAgent(this.id);
        return agent?.homeCoordinates || { x: 0, y: 0 };
    }
    setAction(action, status) {
        this.stateManager.setAgentAction(this.id, action, status);
    }
    setStatus(status) {
        const agent = this.stateManager.getAgent(this.id);
        if (agent) {
            this.stateManager.updateAgent(this.id, { status });
        }
    }
    log(text, level = 'info') {
        this.stateManager.addLog(this.id, this.name, text, level);
        this.streamTerminal(`\x1b[38;5;245m[${new Date().toLocaleTimeString()}]\x1b[0m ${text}\r\n`);
    }
    streamTerminal(chunk) {
        if (this.terminalEmitter) {
            this.terminalEmitter(this.id, chunk);
        }
    }
    consumeTokens(count) {
        this.stateManager.addTokens(this.id, count);
    }
    async walkTo(target, steps = 10, intervalMs = 80) {
        const current = this.getCoordinates();
        this.setStatus('WALKING');
        const dx = (target.x - current.x) / steps;
        const dy = (target.y - current.y) / steps;
        for (let i = 1; i <= steps; i++) {
            const nextX = Math.round(current.x + dx * i);
            const nextY = Math.round(current.y + dy * i);
            this.stateManager.setAgentCoordinates(this.id, { x: nextX, y: nextY });
            this.stateManager.moveAgent(this.id, target);
            await this.sleep(intervalMs);
        }
        this.stateManager.setAgentCoordinates(this.id, target);
    }
    async returnHome() {
        const home = this.getHomeCoordinates();
        await this.walkTo(home, 12, 60);
        this.setStatus('IDLE');
        this.setAction('At workstation', 'IDLE');
    }
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    sendMessage(to, subject, content, type = 'GENERAL', taskId) {
        this.mailbox.send(this.id, to, subject, content, type, taskId);
        this.log(`Sent message to ${to}: "${subject}"`, 'info');
    }
}
exports.BaseAgent = BaseAgent;

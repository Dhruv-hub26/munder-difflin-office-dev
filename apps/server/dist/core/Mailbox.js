"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mailbox = void 0;
class Mailbox {
    messages = [];
    listeners = new Map();
    globalListeners = [];
    constructor() {
        this.messages = [];
    }
    send(from, to, subject, content, type = 'GENERAL', taskId) {
        const message = {
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
            }
            catch (err) {
                console.error(`[Mailbox] Error delivering message to ${to}:`, err);
            }
        }
        // Notify broadcast or global listeners
        for (const listener of this.globalListeners) {
            try {
                listener(message);
            }
            catch (err) {
                console.error(`[Mailbox] Error in global listener:`, err);
            }
        }
        return message;
    }
    subscribe(agentId, listener) {
        if (!this.listeners.has(agentId)) {
            this.listeners.set(agentId, []);
        }
        this.listeners.get(agentId).push(listener);
        return () => {
            const list = this.listeners.get(agentId) || [];
            this.listeners.set(agentId, list.filter((l) => l !== listener));
        };
    }
    subscribeGlobal(listener) {
        this.globalListeners.push(listener);
        return () => {
            this.globalListeners = this.globalListeners.filter((l) => l !== listener);
        };
    }
    getMessagesForAgent(agentId) {
        return this.messages.filter((m) => m.to === agentId || m.to === 'ALL');
    }
    getAllMessages() {
        return [...this.messages];
    }
    markAsRead(messageId) {
        const msg = this.messages.find((m) => m.id === messageId);
        if (msg) {
            msg.read = true;
        }
    }
    clear() {
        this.messages = [];
    }
}
exports.Mailbox = Mailbox;

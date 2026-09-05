"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SandboxExecutor = void 0;
const cross_spawn_1 = __importDefault(require("cross-spawn"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class SandboxExecutor {
    workspacePath;
    constructor(workspacePath) {
        if (workspacePath) {
            this.workspacePath = path.resolve(workspacePath);
        }
        else {
            // Default to root workspace/ directory
            this.workspacePath = path.resolve(process.cwd(), '../../workspace');
            if (!fs.existsSync(this.workspacePath)) {
                // Fallback if running from root or elsewhere
                const localWorkspace = path.resolve(process.cwd(), 'workspace');
                if (fs.existsSync(localWorkspace)) {
                    this.workspacePath = localWorkspace;
                }
                else {
                    this.workspacePath = path.resolve(process.cwd(), 'workspace');
                }
            }
        }
        this.ensureWorkspace();
    }
    getWorkspacePath() {
        return this.workspacePath;
    }
    ensureWorkspace() {
        if (!fs.existsSync(this.workspacePath)) {
            fs.mkdirSync(this.workspacePath, { recursive: true });
        }
    }
    async executeCommand(cmd, args = [], onData) {
        return new Promise((resolve) => {
            let stdout = '';
            let stderr = '';
            const child = (0, cross_spawn_1.default)(cmd, args, {
                cwd: this.workspacePath,
                shell: true,
                env: { ...process.env, FORCE_COLOR: '1' },
            });
            child.stdout?.on('data', (data) => {
                const text = data.toString();
                stdout += text;
                if (onData)
                    onData(text);
            });
            child.stderr?.on('data', (data) => {
                const text = data.toString();
                stderr += text;
                if (onData)
                    onData(text);
            });
            child.on('error', (err) => {
                const errText = `Execution error: ${err.message}\n`;
                stderr += errText;
                if (onData)
                    onData(errText);
                resolve({ exitCode: 1, stdout, stderr });
            });
            child.on('close', (code) => {
                resolve({ exitCode: code ?? 0, stdout, stderr });
            });
        });
    }
    async writeFile(relativePath, content) {
        const fullPath = path.join(this.workspacePath, relativePath);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullPath, content, 'utf-8');
    }
    async readFile(relativePath) {
        const fullPath = path.join(this.workspacePath, relativePath);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${relativePath}`);
        }
        return fs.readFileSync(fullPath, 'utf-8');
    }
    fileExists(relativePath) {
        const fullPath = path.join(this.workspacePath, relativePath);
        return fs.existsSync(fullPath);
    }
    async listFiles() {
        this.ensureWorkspace();
        return this.scanDir(this.workspacePath, '');
    }
    scanDir(currentDir, relativeBase) {
        const results = [];
        if (!fs.existsSync(currentDir))
            return results;
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name === '.git' ||
                entry.name === 'node_modules' ||
                entry.name === '.next' ||
                entry.name === 'dist' ||
                entry.name.startsWith('.')) {
                continue;
            }
            const fullPath = path.join(currentDir, entry.name);
            const relPath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
                const children = this.scanDir(fullPath, relPath);
                results.push({
                    name: entry.name,
                    path: fullPath,
                    relativePath: relPath,
                    type: 'directory',
                    children,
                });
            }
            else {
                const stats = fs.statSync(fullPath);
                results.push({
                    name: entry.name,
                    path: fullPath,
                    relativePath: relPath,
                    type: 'file',
                    size: stats.size,
                    extension: path.extname(entry.name),
                });
            }
        }
        return results;
    }
    async getGitStatus() {
        try {
            const branchRes = await this.executeCommand('git', ['branch', '--show-current']);
            const branch = branchRes.stdout.trim() || 'main';
            const statusRes = await this.executeCommand('git', ['status', '--porcelain']);
            const lines = statusRes.stdout.split('\n').filter((l) => l.trim().length > 0);
            const modified = [];
            const staged = [];
            for (const line of lines) {
                const flag = line.substring(0, 2);
                const file = line.substring(3).trim();
                if (flag[0] !== ' ' && flag[0] !== '?') {
                    staged.push(file);
                }
                if (flag[1] !== ' ') {
                    modified.push(file);
                }
            }
            return { branch, modified, staged };
        }
        catch {
            return { branch: 'main', modified: [], staged: [] };
        }
    }
    async createGitBranch(branchName) {
        try {
            await this.executeCommand('git', ['checkout', '-b', branchName]);
        }
        catch (err) {
            console.warn(`[SandboxExecutor] Git branch checkout notice:`, err);
        }
    }
    async commitAll(message) {
        try {
            await this.executeCommand('git', ['add', '.']);
            await this.executeCommand('git', ['commit', '-m', `"${message}"`]);
        }
        catch (err) {
            console.warn(`[SandboxExecutor] Git commit notice:`, err);
        }
    }
}
exports.SandboxExecutor = SandboxExecutor;

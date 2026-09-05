import spawn from 'cross-spawn';
import * as fs from 'fs';
import * as path from 'path';

export interface FileTreeNode {
  name: string;
  path: string;
  relativePath: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
  children?: FileTreeNode[];
}

export class SandboxExecutor {
  private workspacePath: string;

  constructor(workspacePath?: string) {
    if (workspacePath) {
      this.workspacePath = path.resolve(workspacePath);
    } else {
      // Default to root workspace/ directory
      this.workspacePath = path.resolve(process.cwd(), '../../workspace');
      if (!fs.existsSync(this.workspacePath)) {
        // Fallback if running from root or elsewhere
        const localWorkspace = path.resolve(process.cwd(), 'workspace');
        if (fs.existsSync(localWorkspace)) {
          this.workspacePath = localWorkspace;
        } else {
          this.workspacePath = path.resolve(process.cwd(), 'workspace');
        }
      }
    }

    this.ensureWorkspace();
  }

  public getWorkspacePath(): string {
    return this.workspacePath;
  }

  private ensureWorkspace(): void {
    if (!fs.existsSync(this.workspacePath)) {
      fs.mkdirSync(this.workspacePath, { recursive: true });
    }
  }

  public async executeCommand(
    cmd: string,
    args: string[] = [],
    onData?: (chunk: string) => void
  ): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';

      const child = spawn(cmd, args, {
        cwd: this.workspacePath,
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' },
      });

      child.stdout?.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        if (onData) onData(text);
      });

      child.stderr?.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        if (onData) onData(text);
      });

      child.on('error', (err) => {
        const errText = `Execution error: ${err.message}\n`;
        stderr += errText;
        if (onData) onData(errText);
        resolve({ exitCode: 1, stdout, stderr });
      });

      child.on('close', (code) => {
        resolve({ exitCode: code ?? 0, stdout, stderr });
      });
    });
  }

  public async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.workspacePath, relativePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content, 'utf-8');
  }

  public async readFile(relativePath: string): Promise<string> {
    const fullPath = path.join(this.workspacePath, relativePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${relativePath}`);
    }
    return fs.readFileSync(fullPath, 'utf-8');
  }

  public fileExists(relativePath: string): boolean {
    const fullPath = path.join(this.workspacePath, relativePath);
    return fs.existsSync(fullPath);
  }

  public async listFiles(): Promise<FileTreeNode[]> {
    this.ensureWorkspace();
    return this.scanDir(this.workspacePath, '');
  }

  private scanDir(currentDir: string, relativeBase: string): FileTreeNode[] {
    const results: FileTreeNode[] = [];
    if (!fs.existsSync(currentDir)) return results;

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (
        entry.name === '.git' ||
        entry.name === 'node_modules' ||
        entry.name === '.next' ||
        entry.name === 'dist' ||
        entry.name.startsWith('.')
      ) {
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
      } else {
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

  public async getGitStatus(): Promise<{ branch: string; modified: string[]; staged: string[] }> {
    try {
      const branchRes = await this.executeCommand('git', ['branch', '--show-current']);
      const branch = branchRes.stdout.trim() || 'main';

      const statusRes = await this.executeCommand('git', ['status', '--porcelain']);
      const lines = statusRes.stdout.split('\n').filter((l) => l.trim().length > 0);

      const modified: string[] = [];
      const staged: string[] = [];

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
    } catch {
      return { branch: 'main', modified: [], staged: [] };
    }
  }

  public async createGitBranch(branchName: string): Promise<void> {
    try {
      await this.executeCommand('git', ['checkout', '-b', branchName]);
    } catch (err) {
      console.warn(`[SandboxExecutor] Git branch checkout notice:`, err);
    }
  }

  public async commitAll(message: string): Promise<void> {
    try {
      await this.executeCommand('git', ['add', '.']);
      await this.executeCommand('git', ['commit', '-m', `"${message}"`]);
    } catch (err) {
      console.warn(`[SandboxExecutor] Git commit notice:`, err);
    }
  }
}

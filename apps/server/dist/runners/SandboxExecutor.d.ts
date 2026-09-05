export interface FileTreeNode {
    name: string;
    path: string;
    relativePath: string;
    type: 'file' | 'directory';
    size?: number;
    extension?: string;
    children?: FileTreeNode[];
}
export declare class SandboxExecutor {
    private workspacePath;
    constructor(workspacePath?: string);
    getWorkspacePath(): string;
    private ensureWorkspace;
    executeCommand(cmd: string, args?: string[], onData?: (chunk: string) => void): Promise<{
        exitCode: number;
        stdout: string;
        stderr: string;
    }>;
    writeFile(relativePath: string, content: string): Promise<void>;
    readFile(relativePath: string): Promise<string>;
    fileExists(relativePath: string): boolean;
    listFiles(): Promise<FileTreeNode[]>;
    private scanDir;
    getGitStatus(): Promise<{
        branch: string;
        modified: string[];
        staged: string[];
    }>;
    createGitBranch(branchName: string): Promise<void>;
    commitAll(message: string): Promise<void>;
}

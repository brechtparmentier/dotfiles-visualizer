/**
 * GitHub Service
 * Fetches dotfiles repository content from GitHub API
 */

import { Octokit } from '@octokit/rest';

export class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private branch: string;

  constructor(
    owner: string = 'brechtparmentier',
    repo: string = 'dotfiles',
    branch: string = 'main',
    token?: string
  ) {
    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
    this.octokit = new Octokit({
      auth: token,
      userAgent: 'dotfiles-visualizer/1.0'
    });
  }

  /**
   * Get a single file from the repository
   */
  async getFile(path: string): Promise<string> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: this.branch,
      });

      if ('content' in data && data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }

      throw new Error(`File not found or is a directory: ${path}`);
    } catch (error) {
      console.error(`Failed to fetch file ${path}:`, error);
      throw new Error(`Failed to fetch file: ${path}`);
    }
  }

  /**
   * Get .chezmoi.yaml configuration
   */
  async getConfig(): Promise<string> {
    return this.getFile('.chezmoi.yaml');
  }

  /**
   * Get MODULES.md documentation
   */
  async getModulesDoc(): Promise<string> {
    return this.getFile('MODULES.md');
  }

  /**
   * Get common.sh.tmpl for alias extraction
   */
  async getCommonShell(): Promise<string> {
    return this.getFile('dot_config/shell/common.sh.tmpl');
  }

  /**
   * Get .chezmoiignore file
   */
  async getIgnoreFile(): Promise<string> {
    return this.getFile('.chezmoiignore');
  }

  /**
   * List all files in a directory
   */
  async listFiles(path: string = '', recursive: boolean = false): Promise<string[]> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: this.branch,
      });

      if (!Array.isArray(data)) {
        return [];
      }

      let files: string[] = [];

      for (const item of data) {
        if (item.type === 'file') {
          files.push(item.path);
        } else if (item.type === 'dir' && recursive) {
          // Recursively get files from subdirectories
          const subFiles = await this.listFiles(item.path, true);
          files = files.concat(subFiles);
        }
      }

      return files;
    } catch (error) {
      console.error(`Failed to list files in ${path}:`, error);
      return [];
    }
  }

  /**
   * Get all source files from repository (recursive)
   */
  async getAllSourceFiles(): Promise<string[]> {
    return this.listFiles('', true);
  }

  /**
   * Get repository information
   */
  async getRepoInfo() {
    try {
      const { data } = await this.octokit.repos.get({
        owner: this.owner,
        repo: this.repo,
      });

      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        url: data.html_url,
        defaultBranch: data.default_branch,
        lastUpdated: data.updated_at,
      };
    } catch (error) {
      console.error('Failed to get repo info:', error);
      throw new Error('Failed to fetch repository information');
    }
  }

  /**
   * Get latest commit SHA for cache invalidation
   */
  async getLatestCommitSha(): Promise<string> {
    try {
      const { data } = await this.octokit.repos.getCommit({
        owner: this.owner,
        repo: this.repo,
        ref: this.branch,
      });

      return data.sha;
    } catch (error) {
      console.error('Failed to get latest commit:', error);
      throw new Error('Failed to get latest commit');
    }
  }
}

/**
 * Singleton instance with environment configuration
 */
export function getGitHubService(): GitHubService {
  const owner = process.env.DOTFILES_OWNER || 'brechtparmentier';
  const repo = process.env.DOTFILES_REPO || 'dotfiles';
  const branch = process.env.DOTFILES_BRANCH || 'main';
  const token = process.env.GITHUB_TOKEN;

  return new GitHubService(owner, repo, branch, token);
}

import { getGitHubRepoConfig } from './github-config';

export type GitHubFileContent = {
  path: string;
  content: string;
  sha: string;
};

export type SaveFileInput = {
  path: string;
  content: string;
  sha?: string;
  message: string;
  encoding?: 'utf-8' | 'base64';
};

export type GitHubUser = {
  login: string;
  name: string | null;
};

export class GitHubApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
  }
}

export class GitHubClient {
  private token = '';

  initialize(token: string) {
    this.token = token.trim();
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new GitHubApiError(
        response.status,
        body || `GitHub API request failed with status ${response.status}`,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  async validateToken() {
    await this.getCurrentUser();
  }

  async getCurrentUser(): Promise<GitHubUser> {
    const user = await this.request<{ login: string; name: string | null }>('/user');
    return { login: user.login, name: user.name };
  }

  async loadFile(path: string): Promise<GitHubFileContent> {
    const { owner, repo, branch } = getGitHubRepoConfig();
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const data = await this.request<{
      content: string;
      sha: string;
      path: string;
    }>(`/repos/${owner}/${repo}/contents/${encodedPath}?ref=${branch}`);

    return {
      path: data.path,
      sha: data.sha,
      content: decodeBase64Utf8(data.content),
    };
  }

  async saveFile(input: SaveFileInput) {
    const { owner, repo, branch } = getGitHubRepoConfig();
    const encodedPath = input.path.split('/').map(encodeURIComponent).join('/');

    return this.request<{ commit: { sha: string } }>(
      `/repos/${owner}/${repo}/contents/${encodedPath}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.message,
          content:
            input.encoding === 'base64'
              ? input.content
              : encodeBase64Utf8(input.content),
          sha: input.sha,
          branch,
        }),
      },
    );
  }

  async saveFiles(entries: SaveFileInput[]) {
    const results = [];
    for (const entry of entries) {
      const result = await this.saveFile(entry);
      results.push(result);
    }
    return results;
  }

  async uploadImage(path: string, base64Content: string, sha?: string, message?: string) {
    return this.saveFile({
      path,
      content: base64Content,
      encoding: 'base64',
      sha,
      message: message ?? `Update image ${path}`,
    });
  }

  async listDirectory(path: string) {
    const { owner, repo, branch } = getGitHubRepoConfig();
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const data = await this.request<
      Array<{ name: string; path: string; type: 'file' | 'dir'; sha: string }>
    >(`/repos/${owner}/${repo}/contents/${encodedPath}?ref=${branch}`);
    return Array.isArray(data) ? data : [];
  }

  getActionsUrl() {
    const { owner, repo } = getGitHubRepoConfig();
    return `https://github.com/${owner}/${repo}/actions`;
  }
}

function decodeBase64Utf8(value: string) {
  const normalized = value.replace(/\n/g, '');
  return decodeURIComponent(
    Array.from(atob(normalized), (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
  );
}

function encodeBase64Utf8(value: string) {
  return btoa(
    encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    ),
  );
}

export const githubClient = new GitHubClient();

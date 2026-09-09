import { githubClient, GitHubApiError } from './github-client';
import { localContentClient } from './local-content-client';
import type {
  ContentDirectoryEntry,
  ContentFile,
  ContentStorageClient,
  SaveContentFileInput,
} from './content-client.types';

export { GitHubApiError };

class GitHubContentClient implements ContentStorageClient {
  async validateAccess() {
    return githubClient.getCurrentUser();
  }

  async loadFile(path: string): Promise<ContentFile> {
    return githubClient.loadFile(path);
  }

  async saveFile(input: SaveContentFileInput) {
    const result = await githubClient.saveFile({
      path: input.path,
      content: input.content,
      sha: input.sha,
      message: input.message ?? `Update ${input.path}`,
      encoding: input.encoding,
    });
    return { commitSha: result.commit.sha };
  }

  async listDirectory(path: string): Promise<ContentDirectoryEntry[]> {
    const entries = await githubClient.listDirectory(path);
    return entries.map((entry) => ({
      name: entry.name,
      path: entry.path,
      type: entry.type,
    }));
  }

  async uploadImage(path: string, base64Content: string, message?: string) {
    const result = await githubClient.uploadImage(path, base64Content, undefined, message);
    return { commitSha: result.commit.sha };
  }
}

const githubContentClient = new GitHubContentClient();

export function getContentStorageClient(mode: 'local' | 'github'): ContentStorageClient {
  return mode === 'local' ? localContentClient : githubContentClient;
}

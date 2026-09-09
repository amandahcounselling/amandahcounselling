import type {
  ContentDirectoryEntry,
  ContentFile,
  ContentStorageClient,
  SaveContentFileInput,
} from './content-client.types';

const API_BASE = '/__admin/content';

async function request<T>(pathname: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${pathname}`, init);
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? `Local admin request failed (${response.status}).`);
  }

  return payload;
}

export class LocalContentClient implements ContentStorageClient {
  async validateAccess() {
    return { login: 'local-dev', name: 'Local development' };
  }

  async loadFile(path: string): Promise<ContentFile> {
    const data = await request<{ path: string; content: string }>(
      `/file?path=${encodeURIComponent(path)}`,
    );
    return { path: data.path, content: data.content };
  }

  async saveFile(input: SaveContentFileInput) {
    await request('/file', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: input.path, content: input.content }),
    });
    return {};
  }

  async listDirectory(path: string): Promise<ContentDirectoryEntry[]> {
    const data = await request<{ entries: ContentDirectoryEntry[] }>(
      `/list?path=${encodeURIComponent(path)}`,
    );
    return data.entries;
  }

  async uploadImage(path: string, base64Content: string, _message?: string) {
    await request('/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, contentBase64: base64Content }),
    });
    return {};
  }
}

export const localContentClient = new LocalContentClient();

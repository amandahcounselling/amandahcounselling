export type ContentFile = {
  path: string;
  content: string;
  sha?: string;
};

export type SaveContentFileInput = {
  path: string;
  content: string;
  sha?: string;
  message?: string;
  encoding?: 'utf-8' | 'base64';
};

export type ContentDirectoryEntry = {
  name: string;
  path: string;
  type: 'file' | 'dir';
};

export interface ContentStorageClient {
  validateAccess(): Promise<{ login: string; name: string | null }>;
  loadFile(path: string): Promise<ContentFile>;
  saveFile(input: SaveContentFileInput): Promise<{ commitSha?: string }>;
  listDirectory(path: string): Promise<ContentDirectoryEntry[]>;
  uploadImage(path: string, base64Content: string, message?: string): Promise<{ commitSha?: string }>;
}

export function isLocalAdminEnvironment() {
  return import.meta.env.DEV;
}

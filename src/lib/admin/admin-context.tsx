import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  contentData,
  CONTENT_REPO_PATHS,
  getByPath,
  getContentBySourceId,
  setByPath,
} from '../content';
import { buildCommitMessage, buildImageCommitMessage } from './commit-messages';
import { getContentSources, markdownCollections } from './content-sources';
import { getContentStorageClient, GitHubApiError } from './content-client';
import { isLocalAdminEnvironment } from './content-client.types';
import { githubClient } from './github-client';
import { getGitHubRepoLabel, isGitHubRepoConfigured } from './github-config';
import { parseMarkdown, serializeMarkdown } from './markdown-io';
import {
  clearStoredToken,
  getStoredAuthMode,
  getStoredEditMode,
  getStoredToken,
  getStoredUser,
  hasStoredSession,
  setStoredAuthMode,
  setStoredEditMode,
  setStoredToken,
  setStoredUser,
  type AdminAuthMode,
  type StoredGitHubUser,
} from './token-storage';

export type MarkdownDraft = {
  type: 'markdown';
  repoPath: string;
  frontmatter: Record<string, unknown>;
  body: string;
};

export type JsonDraft = {
  type: 'json';
  sourceId: string;
  repoPath: string;
  value: Record<string, unknown>;
};

type SaveState = 'idle' | 'saving' | 'success' | 'error';

type AdminContextValue = {
  sessionReady: boolean;
  authMode: AdminAuthMode | null;
  isAuthenticated: boolean;
  isEditMode: boolean;
  isLocalMode: boolean;
  user: StoredGitHubUser | null;
  repoLabel: string;
  isConfigured: boolean;
  dirtySourceIds: string[];
  saveState: SaveState;
  saveError: string;
  lastCommitSha: string;
  login: (token: string) => Promise<void>;
  loginLocal: () => Promise<void>;
  logout: () => void;
  enableEditMode: () => void;
  disableEditMode: () => void;
  getFieldValue: (sourceId: string, fieldPath: string) => unknown;
  setFieldValue: (sourceId: string, fieldPath: string, value: unknown) => void;
  getJsonDraft: (sourceId: string) => Record<string, unknown> | undefined;
  getMarkdownDraft: (repoPath: string) => MarkdownDraft | undefined;
  registerMarkdownDraft: (repoPath: string, frontmatter: Record<string, unknown>, body: string) => void;
  updateMarkdownDraft: (
    repoPath: string,
    frontmatter: Record<string, unknown>,
    body: string,
  ) => void;
  saveDirty: () => Promise<void>;
  discardDirty: () => void;
  uploadImage: (
    file: File,
    fieldKey: string,
    options?: { sourceId: string; fieldPath: string },
  ) => Promise<string>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

function buildInitialJsonDrafts() {
  const drafts = new Map<string, JsonDraft>();
  for (const [sourceId, repoPath] of Object.entries(CONTENT_REPO_PATHS)) {
    const value = getContentBySourceId(sourceId);
    if (value && typeof value === 'object') {
      drafts.set(sourceId, {
        type: 'json',
        sourceId,
        repoPath,
        value: structuredClone(value) as Record<string, unknown>,
      });
    }
  }
  return drafts;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [sessionReady, setSessionReady] = useState(false);
  const [authMode, setAuthMode] = useState<AdminAuthMode | null>(null);
  const [user, setUser] = useState<StoredGitHubUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [jsonDrafts, setJsonDrafts] = useState(() => buildInitialJsonDrafts());
  const [markdownDrafts, setMarkdownDrafts] = useState<Map<string, MarkdownDraft>>(new Map());
  const [originalJson, setOriginalJson] = useState(() => buildInitialJsonDrafts());
  const [originalMarkdown, setOriginalMarkdown] = useState<Map<string, MarkdownDraft>>(new Map());
  const [fileShas, setFileShas] = useState<Record<string, string>>({});
  const [dirtyPaths, setDirtyPaths] = useState<Set<string>>(new Set());
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState('');
  const [lastCommitSha, setLastCommitSha] = useState('');

  const repoLabel = isLocalAdminEnvironment() ? 'Local workspace' : getGitHubRepoLabel();
  const isConfigured = isLocalAdminEnvironment() || isGitHubRepoConfigured();
  const isLocalMode = authMode === 'local';

  const dirtySourceIds = useMemo(() => {
    const ids = new Set<string>();
    for (const path of dirtyPaths) {
      if (path.startsWith('src/content-data/')) {
        const source = Object.entries(CONTENT_REPO_PATHS).find(([, repoPath]) => repoPath === path);
        if (source) ids.add(source[0]);
      } else if (path.startsWith('src/content/')) {
        ids.add(path);
      } else if (path.startsWith('public/images/')) {
        ids.add(path);
      }
    }
    return Array.from(ids);
  }, [dirtyPaths]);

  const refreshRemoteState = useCallback(async (mode: AdminAuthMode) => {
    const client = getContentStorageClient(mode);
    const shas: Record<string, string> = {};

    for (const source of getContentSources()) {
      const file = await client.loadFile(source.repoPath);
      if (file.sha) {
        shas[source.repoPath] = file.sha;
      }
      const parsed = JSON.parse(file.content) as Record<string, unknown>;
      setJsonDrafts((current) => {
        const next = new Map(current);
        next.set(source.id, {
          type: 'json',
          sourceId: source.id,
          repoPath: source.repoPath,
          value: parsed,
        });
        return next;
      });
      setOriginalJson((current) => {
        const next = new Map(current);
        next.set(source.id, {
          type: 'json',
          sourceId: source.id,
          repoPath: source.repoPath,
          value: structuredClone(parsed),
        });
        return next;
      });
    }

    for (const collection of markdownCollections) {
      const entries = await client.listDirectory(collection.repoPath);
      for (const entry of entries.filter((item) => item.type === 'file' && item.name.endsWith('.md'))) {
        const file = await client.loadFile(entry.path);
        if (file.sha) {
          shas[entry.path] = file.sha;
        }
        const parsed = parseMarkdown(file.content);
        const draft: MarkdownDraft = {
          type: 'markdown',
          repoPath: entry.path,
          frontmatter: parsed.frontmatter,
          body: parsed.body,
        };
        setMarkdownDrafts((current) => new Map(current).set(entry.path, draft));
        setOriginalMarkdown((current) => new Map(current).set(entry.path, structuredClone(draft)));
      }
    }

    setFileShas(shas);
    setDirtyPaths(new Set());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!hasStoredSession()) {
        if (!cancelled) setSessionReady(true);
        return;
      }

      const storedMode = getStoredAuthMode() ?? (getStoredToken() ? 'github' : null);
      const storedUser = getStoredUser();

      try {
        if (storedMode === 'local' && isLocalAdminEnvironment()) {
          setAuthMode('local');
          setUser(storedUser ?? { login: 'local-dev', name: 'Local development' });
          setIsAuthenticated(true);
          setIsEditMode(getStoredEditMode());
          await refreshRemoteState('local');
        } else if (storedMode === 'github') {
          const token = getStoredToken();
          if (!token) {
            clearStoredToken();
          } else {
            setStoredAuthMode('github');
            githubClient.initialize(token);
            setAuthMode('github');
            setUser(storedUser);
            setIsAuthenticated(true);
            setIsEditMode(getStoredEditMode());
            await refreshRemoteState('github');
          }
        }
      } catch (error) {
        if (
          storedMode === 'github' &&
          error instanceof GitHubApiError &&
          error.status === 401
        ) {
          clearStoredToken();
          setAuthMode(null);
          setUser(null);
          setIsAuthenticated(false);
          setIsEditMode(false);
        } else {
          setSaveError(
            error instanceof Error
              ? error.message
              : 'Unable to refresh admin content.',
          );
        }
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, [refreshRemoteState]);

  const loginLocal = useCallback(async () => {
    const client = getContentStorageClient('local');
    const currentUser = await client.validateAccess();
    setStoredAuthMode('local');
    setStoredUser(currentUser);
    setAuthMode('local');
    setUser(currentUser);
    setIsAuthenticated(true);
    setSaveError('');
    await refreshRemoteState('local');
  }, [refreshRemoteState]);

  const login = useCallback(
    async (token: string) => {
      githubClient.initialize(token);
      const client = getContentStorageClient('github');
      const currentUser = await client.validateAccess();
      setStoredAuthMode('github');
      setStoredToken(token);
      setStoredUser(currentUser);
      setAuthMode('github');
      setUser(currentUser);
      setIsAuthenticated(true);
      setSaveError('');
      await refreshRemoteState('github');
    },
    [refreshRemoteState],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setAuthMode(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsEditMode(false);
    setJsonDrafts(buildInitialJsonDrafts());
    setMarkdownDrafts(new Map());
    setOriginalJson(buildInitialJsonDrafts());
    setOriginalMarkdown(new Map());
    setDirtyPaths(new Set());
    setSaveState('idle');
    setSaveError('');
    setLastCommitSha('');
  }, []);

  const getJsonDraft = useCallback(
    (sourceId: string) => jsonDrafts.get(sourceId)?.value,
    [jsonDrafts],
  );

  const getMarkdownDraft = useCallback(
    (repoPath: string) => markdownDrafts.get(repoPath),
    [markdownDrafts],
  );

  const registerMarkdownDraft = useCallback(
    (repoPath: string, frontmatter: Record<string, unknown>, body: string) => {
      setMarkdownDrafts((current) => {
        if (current.has(repoPath)) return current;
        const draft: MarkdownDraft = { type: 'markdown', repoPath, frontmatter, body };
        setOriginalMarkdown((original) => new Map(original).set(repoPath, structuredClone(draft)));
        return new Map(current).set(repoPath, draft);
      });
    },
    [],
  );

  const updateMarkdownDraft = useCallback(
    (repoPath: string, frontmatter: Record<string, unknown>, body: string) => {
      const draft: MarkdownDraft = { type: 'markdown', repoPath, frontmatter, body };
      setMarkdownDrafts((current) => new Map(current).set(repoPath, draft));
      setDirtyPaths((current) => new Set(current).add(repoPath));
    },
    [],
  );

  const getFieldValue = useCallback(
    (sourceId: string, fieldPath: string) => {
      const draft = jsonDrafts.get(sourceId)?.value ?? getContentBySourceId(sourceId);
      return getByPath(draft, fieldPath);
    },
    [jsonDrafts],
  );

  const setFieldValue = useCallback(
    (sourceId: string, fieldPath: string, value: unknown) => {
      setJsonDrafts((current) => {
        const existing = current.get(sourceId);
        if (!existing) return current;
        const nextValue = setByPath(existing.value, fieldPath, value);
        const next = new Map(current);
        next.set(sourceId, { ...existing, value: nextValue });
        return next;
      });
      const repoPath = CONTENT_REPO_PATHS[sourceId];
      if (repoPath) {
        setDirtyPaths((current) => new Set(current).add(repoPath));
      }
    },
    [],
  );

  const discardDirty = useCallback(() => {
    setJsonDrafts(new Map(originalJson));
    setMarkdownDrafts(new Map(originalMarkdown));
    setDirtyPaths(new Set());
    setSaveState('idle');
    setSaveError('');
  }, [originalJson, originalMarkdown]);

  const saveDirty = useCallback(async () => {
    if (!authMode) throw new Error('Not authenticated');

    const client = getContentStorageClient(authMode);
    if (authMode === 'github') {
      githubClient.initialize(getStoredToken());
    }

    setSaveState('saving');
    setSaveError('');

    try {
      const saves: Array<{ path: string; content: string; message: string }> = [];

      for (const path of dirtyPaths) {
        if (path.startsWith('public/images/')) {
          continue;
        }

        const jsonSource = Object.entries(CONTENT_REPO_PATHS).find(([, repoPath]) => repoPath === path);
        if (jsonSource) {
          const draft = jsonDrafts.get(jsonSource[0]);
          if (draft) {
            saves.push({
              path,
              content: `${JSON.stringify(draft.value, null, 2)}\n`,
              message: buildCommitMessage([jsonSource[0]]),
            });
          }
          continue;
        }

        const markdownDraft = markdownDrafts.get(path);
        if (markdownDraft) {
          saves.push({
            path,
            content: serializeMarkdown(markdownDraft.frontmatter, markdownDraft.body),
            message: buildCommitMessage([path]),
          });
        }
      }

      let lastSha = '';
      for (const save of saves) {
        const result = await client.saveFile({
          path: save.path,
          content: save.content,
          sha: fileShas[save.path],
          message: save.message,
        });
        if (result.commitSha) {
          lastSha = result.commitSha;
        }

        if (authMode === 'github') {
          const reloaded = await client.loadFile(save.path);
          if (reloaded.sha) {
            setFileShas((current) => ({ ...current, [save.path]: reloaded.sha }));
          }
        }
      }

      setOriginalJson(new Map(jsonDrafts));
      setOriginalMarkdown(new Map(markdownDrafts));
      setDirtyPaths(new Set());
      setLastCommitSha(lastSha);
      setSaveState('success');
    } catch (error) {
      const message =
        error instanceof GitHubApiError
          ? error.status === 401
            ? 'Your GitHub token is invalid or expired.'
            : error.status === 403
              ? 'This token does not have write permission for this repository.'
              : error.status === 409
                ? 'Someone else updated this file first. Reload and try again.'
                : error.message
          : error instanceof Error
            ? error.message
            : 'Unable to save changes.';
      setSaveError(message);
      setSaveState('error');
      if (error instanceof GitHubApiError && error.status === 401) {
        logout();
      }
      throw error;
    }
  }, [authMode, dirtyPaths, fileShas, jsonDrafts, logout, markdownDrafts]);

  const uploadImage = useCallback(
    async (
      file: File,
      fieldKey: string,
      options?: { sourceId: string; fieldPath: string },
    ) => {
      if (!authMode) throw new Error('Not authenticated');

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be 5 MB or smaller.');
      }

      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!allowed.includes(file.type)) {
        throw new Error('Use JPG, PNG, WebP, or SVG images.');
      }

      const extension = file.name.split('.').pop() ?? 'jpg';
      const repoPath = `public/images/${fieldKey}-${Date.now()}.${extension}`;
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (const byte of bytes) {
        binary += String.fromCharCode(byte);
      }
      const base64 = btoa(binary);

      const client = getContentStorageClient(authMode);
      if (authMode === 'github') {
        githubClient.initialize(getStoredToken());
      }

      const result = await client.uploadImage(
        repoPath,
        base64,
        buildImageCommitMessage(repoPath),
      );
      if (result.commitSha) {
        setLastCommitSha(result.commitSha);
      }

      const webPath = `/${repoPath.replace(/^public/, '')}`;

      if (options) {
        let updatedDraft: JsonDraft | undefined;
        setJsonDrafts((current) => {
          const existing = current.get(options.sourceId);
          if (!existing) return current;
          const nextValue = setByPath(existing.value, options.fieldPath, webPath);
          updatedDraft = { ...existing, value: nextValue };
          return new Map(current).set(options.sourceId, updatedDraft);
        });

        if (updatedDraft) {
          await client.saveFile({
            path: updatedDraft.repoPath,
            content: `${JSON.stringify(updatedDraft.value, null, 2)}\n`,
            sha: fileShas[updatedDraft.repoPath],
            message: buildCommitMessage([options.sourceId]),
          });

          setOriginalJson((current) => new Map(current).set(options.sourceId, structuredClone(updatedDraft!)));
          setDirtyPaths((current) => {
            const next = new Set(current);
            next.delete(updatedDraft!.repoPath);
            return next;
          });
        }
      }

      return webPath;
    },
    [authMode, fileShas],
  );

  const enableEditMode = useCallback(() => {
    setStoredEditMode(true);
    setIsEditMode(true);
  }, []);

  const disableEditMode = useCallback(() => {
    setStoredEditMode(false);
    setIsEditMode(false);
  }, []);

  const value: AdminContextValue = {
    sessionReady,
    authMode,
    isAuthenticated,
    isEditMode: isAuthenticated && isEditMode,
    isLocalMode,
    user,
    repoLabel,
    isConfigured,
    dirtySourceIds,
    saveState,
    saveError,
    lastCommitSha,
    login,
    loginLocal,
    logout,
    enableEditMode,
    disableEditMode,
    getFieldValue,
    setFieldValue,
    getJsonDraft,
    getMarkdownDraft,
    registerMarkdownDraft,
    updateMarkdownDraft,
    saveDirty,
    discardDirty,
    uploadImage,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}

export function useOptionalAdmin() {
  return useContext(AdminContext);
}

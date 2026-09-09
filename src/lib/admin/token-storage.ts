const TOKEN_KEY = 'github_pat';
const USER_KEY = 'github_user';
const MODE_KEY = 'admin_auth_mode';
const EDIT_MODE_KEY = 'admin_edit_mode';

export type AdminAuthMode = 'local' | 'github';

export type StoredGitHubUser = {
  login: string;
  name: string | null;
};

export function getStoredAuthMode(): AdminAuthMode | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const mode = window.localStorage.getItem(MODE_KEY);
  return mode === 'local' || mode === 'github' ? mode : null;
}

export function setStoredAuthMode(mode: AdminAuthMode) {
  window.localStorage.setItem(MODE_KEY, mode);
}

export function getStoredToken() {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.localStorage.getItem(TOKEN_KEY) ?? '';
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(MODE_KEY);
  window.localStorage.removeItem(EDIT_MODE_KEY);
}

export function getStoredUser(): StoredGitHubUser | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredGitHubUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredGitHubUser) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function hasStoredSession() {
  const mode = getStoredAuthMode();
  if (mode === 'local') {
    return true;
  }
  if (mode === 'github') {
    return Boolean(getStoredToken());
  }
  // Support sessions created before auth mode was tracked.
  return Boolean(getStoredToken());
}

export function getStoredEditMode() {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(EDIT_MODE_KEY) === '1';
}

export function setStoredEditMode(enabled: boolean) {
  if (enabled) {
    window.localStorage.setItem(EDIT_MODE_KEY, '1');
  } else {
    window.localStorage.removeItem(EDIT_MODE_KEY);
  }
}

import { useState } from 'react';
import { GitHubApiError } from '../../lib/admin/content-client';
import { isLocalAdminEnvironment } from '../../lib/admin/content-client.types';
import { useAdmin } from '../../lib/admin/admin-context';
import { withBase } from '../../lib/paths';

export default function LoginForm() {
  const admin = useAdmin();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isLocalDev = isLocalAdminEnvironment();

  const handleLocalLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await admin.loginLocal();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to start local editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await admin.login(token);
    } catch (loginError) {
      const message =
        loginError instanceof GitHubApiError
          ? loginError.status === 401
            ? 'Your GitHub token is invalid or expired.'
            : loginError.message
          : loginError instanceof Error
            ? loginError.message
            : 'Unable to sign in.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!admin.isConfigured) {
    return (
      <div className="bg-card rounded-[2rem] border border-border p-8">
        <h2 className="font-heading text-2xl font-bold">Repository not configured</h2>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Set <code>PUBLIC_GITHUB_OWNER</code>, <code>PUBLIC_GITHUB_REPO</code>, and{' '}
          <code>PUBLIC_GITHUB_BRANCH</code> in your environment before using GitHub publishing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLocalDev && (
        <div className="bg-card space-y-4 rounded-[2rem] border border-border p-8">
          <div>
            <h2 className="font-heading text-2xl font-bold">Local development</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Save edits directly to this repository on your machine. No GitHub commits are created
              while running <code>npm run dev</code>. Requires{' '}
              <code>PUBLIC_ADMIN_LOCAL_EDITING=true</code> in your <code>.env</code>.
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleLocalLogin()}
            className="bg-primary text-primary-foreground rounded-full px-6 py-3 font-bold"
          >
            {loading ? 'Starting…' : 'Start local editing'}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card space-y-5 rounded-[2rem] border border-border p-8">
        <div>
          <h2 className="font-heading text-2xl font-bold">
            {isLocalDev ? 'Publish with GitHub' : 'Sign in with GitHub'}
          </h2>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            Paste a fine-grained personal access token with Contents read/write access for{' '}
            <strong>{admin.repoLabel}</strong>. Your token stays in this browser only.
          </p>
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-bold">Personal access token</span>
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.currentTarget.value)}
            required={!isLocalDev}
            className="border-border bg-background w-full rounded-xl border px-4 py-3 outline-none"
            placeholder="github_pat_..."
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading || (!token && !isLocalDev)}
          className="bg-primary text-primary-foreground rounded-full px-6 py-3 font-bold"
        >
          {loading ? 'Validating…' : isLocalDev ? 'Sign in with GitHub token' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export function TokenSettings() {
  const admin = useAdmin();

  return (
    <div className="bg-card rounded-[2rem] border border-border p-8">
      <h2 className="font-heading text-2xl font-bold">Session settings</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-bold">Signed in as</dt>
          <dd>{admin.user?.login}</dd>
        </div>
        <div>
          <dt className="font-bold">Mode</dt>
          <dd>{admin.isLocalMode ? 'Local file editing' : 'GitHub publishing'}</dd>
        </div>
        {!admin.isLocalMode && (
          <div>
            <dt className="font-bold">Repository</dt>
            <dd>{admin.repoLabel}</dd>
          </div>
        )}
      </dl>
      <button
        type="button"
        onClick={admin.logout}
        className="border-border mt-6 rounded-full border px-5 py-2 text-sm font-bold"
      >
        Sign out
      </button>
    </div>
  );
}

export function AdminNav() {
  const admin = useAdmin();

  return (
    <div className="flex flex-wrap gap-3">
      <a href={withBase('/admin')} className="rounded-full border border-border px-4 py-2 text-sm font-bold">
        Dashboard
      </a>
      <a
        href={withBase('/admin/settings')}
        className="rounded-full border border-border px-4 py-2 text-sm font-bold"
      >
        Site Settings
      </a>
      <a href={withBase('/admin/faq')} className="rounded-full border border-border px-4 py-2 text-sm font-bold">
        FAQ
      </a>
      <a href={withBase('/admin/fees')} className="rounded-full border border-border px-4 py-2 text-sm font-bold">
        Fees
      </a>
      <a href={withBase('/')} className="rounded-full border border-border px-4 py-2 text-sm font-bold">
        View site
      </a>
      {admin.isAuthenticated && (
        <button
          type="button"
          onClick={admin.enableEditMode}
          className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-bold"
        >
          Enable edit mode
        </button>
      )}
    </div>
  );
}

import AdminSettingsForm from './AdminSettingsForm';
import FaqEditor from './FaqEditor';
import FeesEditor from './FeesEditor';
import LoginForm, { AdminNav, TokenSettings } from './LoginForm';
import { useAdmin } from '../../lib/admin/admin-context';
import { githubClient } from '../../lib/admin/github-client';

type AdminAppProps = {
  view: 'dashboard' | 'settings' | 'faq' | 'fees';
};

function AdminLoadingState() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-muted-foreground text-sm">Loading admin session…</p>
    </div>
  );
}

export default function AdminApp({ view }: AdminAppProps) {
  const admin = useAdmin();

  if (!admin.sessionReady) {
    return <AdminLoadingState />;
  }

  if (!admin.isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 px-6 py-16">
        <div>
          <p className="text-primary text-sm font-bold uppercase tracking-[0.2em]">Admin</p>
          <h1 className="font-heading mt-3 text-4xl font-bold">Content management</h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Sign in to edit site settings, FAQ items, fees, and page content. In production, changes are
            saved as Git commits and published through GitHub Pages.
          </p>
        </div>
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-16">
      <div className="space-y-4">
        <p className="text-primary text-sm font-bold uppercase tracking-[0.2em]">Admin</p>
        <h1 className="font-heading text-4xl font-bold">
          {view === 'settings'
            ? 'Site Settings'
            : view === 'faq'
              ? 'FAQ'
              : view === 'fees'
                ? 'Fees & Services'
                : 'Dashboard'}
        </h1>
        <AdminNav />
      </div>

      {view === 'dashboard' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card rounded-[2rem] border border-border p-8">
            <h2 className="font-heading text-2xl font-bold">Inline editing</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Enable edit mode, visit any public page, and update page-local copy and images
              directly where they appear. Shared settings stay here in Site Settings.
            </p>
            <button
              type="button"
              onClick={admin.enableEditMode}
              className="bg-primary text-primary-foreground mt-5 rounded-full px-5 py-3 font-bold"
            >
              Enable edit mode
            </button>
          </div>
          <TokenSettings />
          {admin.lastCommitSha && !admin.isLocalMode && (
            <div className="bg-card rounded-[2rem] border border-border p-8 md:col-span-2">
              <h2 className="font-heading text-2xl font-bold">Publish status</h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Last commit: <code>{admin.lastCommitSha.slice(0, 7)}</code>
              </p>
              <a
                href={githubClient.getActionsUrl()}
                target="_blank"
                rel="noreferrer"
                className="text-primary mt-3 inline-block font-bold"
              >
                View GitHub Actions deploy
              </a>
            </div>
          )}
          {admin.isLocalMode && (
            <div className="bg-card rounded-[2rem] border border-border p-8 md:col-span-2">
              <h2 className="font-heading text-2xl font-bold">Local saves</h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Changes are written directly to files in this repository. Refresh the page to see
                build-time content updates, or rely on Vite hot reload where supported.
              </p>
            </div>
          )}
        </div>
      )}

      {view === 'settings' && <AdminSettingsForm />}
      {view === 'faq' && <FaqEditor />}
      {view === 'fees' && <FeesEditor />}
    </div>
  );
}

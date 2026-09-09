import { useEffect } from 'react';
import { useOptionalAdmin } from '../../lib/admin/admin-context';
import { githubClient } from '../../lib/admin/github-client';
import { withBase } from '../../lib/paths';

export default function EditModeToolbar() {
  const admin = useOptionalAdmin();

  useEffect(() => {
    if (!admin?.isEditMode || admin.dirtySourceIds.length === 0) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [admin?.dirtySourceIds.length, admin?.isEditMode]);

  if (!admin?.sessionReady || !admin.isAuthenticated) return null;

  if (!admin.isEditMode) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Signed in as <strong>{admin.user?.login}</strong>
            {admin.isLocalMode && <span className="ml-2">(local)</span>}
          </p>
          <button
            type="button"
            onClick={admin.enableEditMode}
            className="bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-bold"
          >
            Enable edit mode
          </button>
        </div>
      </div>
    );
  }

  const saveLabel = admin.isLocalMode ? 'Save locally' : 'Save & publish';

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-bold">
            Editing as {admin.user?.login}
            {admin.dirtySourceIds.length > 0 && (
              <span className="text-primary ml-2">
                · {admin.dirtySourceIds.length} unsaved change
                {admin.dirtySourceIds.length === 1 ? '' : 's'}
              </span>
            )}
          </p>
          {admin.saveState === 'success' && (
            <p className="text-sm text-green-700">
              {admin.isLocalMode ? (
                'Saved to local files.'
              ) : (
                <>
                  Published.{' '}
                  <a
                    href={githubClient.getActionsUrl()}
                    className="font-bold underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View deploy status
                  </a>
                </>
              )}
            </p>
          )}
          {admin.saveError && <p className="text-sm text-red-700">{admin.saveError}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={withBase('/admin')}
            className="border-border rounded-full border px-4 py-2 text-sm font-bold"
          >
            Site Settings
          </a>
          <button
            type="button"
            onClick={admin.discardDirty}
            disabled={admin.dirtySourceIds.length === 0 || admin.saveState === 'saving'}
            className="border-border rounded-full border px-4 py-2 text-sm font-bold"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => void admin.saveDirty()}
            disabled={admin.dirtySourceIds.length === 0 || admin.saveState === 'saving'}
            className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-bold"
          >
            {admin.saveState === 'saving' ? 'Saving…' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
